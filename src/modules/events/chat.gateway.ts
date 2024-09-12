import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../../modules/users';
import { JwtWsGuard } from '../../common/guards';
import { AuthService } from '../auth/services';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService) { }

  async handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    const password = client.handshake.query.password as string;
    if (!username || !password) {
      client.disconnect();
      return;
    }
    try {
      const res = await this.authService.login({ username, password });
      if (!res || !res.accessToken) {
        client.disconnect();
        return;
      }

      client.data.token = res.accessToken;

      await this.usersService.updateUserStatus(username, client.id, true);
      const users = await this.usersService.findAllOnline();
      const userMessages = await this.usersService.findMessages(username);
      this.server.emit('usersList', users);
      this.server.to(client.id).emit('messageQueue', userMessages);
    } catch (error) {
      client.disconnect();
      console.error('Error during authentication:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    const username = client.handshake.query.username as string;
    if (username) {
      await this.usersService.updateUserStatus(username, '', false);
      const users = await this.usersService.findAllOnline();
      this.server.emit('usersList', users);
    }
  }


  @UseGuards(JwtWsGuard)
  @SubscribeMessage('newMessage')
  async sendMessage(client: Socket, payload: { to: string; content: string }) {
    const { to, content } = payload;
    const toUser = await this.usersService.findByUsername(to);
    if (toUser.findUser.online == false) {
      this.usersService.saveMessage(to, { from: client.data.user.username, content });
      return
    }
    if (!toUser) {
      return;
    }
    const message = {
      from: client.data.user.username,
      content,
    };
    this.server.to(toUser.findUser.wsClientId).emit('newMessage', message);
  }

}