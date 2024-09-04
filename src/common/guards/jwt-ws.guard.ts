import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { UsersService } from "../../modules/users";

@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private jwtService: JwtService, private userService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {
            const client = context.switchToWs().getClient();
            const decoded = this.jwtService.decode(client.data.token) as any;
            const { findUser: user } = await this.userService.findOne(decoded._doc);
            context.switchToWs().getClient().data.user = user;
            return true;
        } catch (error) {
            console.log('error', error);
            throw new WsException('Invalid token');
        }
    }
}