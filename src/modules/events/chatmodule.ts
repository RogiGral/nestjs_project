import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema, MessageEntity, MessageSchema, InvoiceEntity, InvoiceSchema } from 'src/entitities';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: MessageEntity.name, schema: MessageSchema },
      { name: InvoiceEntity.name, schema: InvoiceSchema }
    ]),
  ],
  providers: [ChatGateway, JwtService, UsersService],
  exports: [ChatGateway],
})
export class ChatModule { }
