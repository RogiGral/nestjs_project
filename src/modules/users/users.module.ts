import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from '../../entitities';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: InvoiceEntity.name, schema: InvoiceSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule { }
