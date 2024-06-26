import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers';
import { InvoicesService } from './services';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from '../../entitities';
import { UsersService } from '../users';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: InvoiceEntity.name, schema: InvoiceSchema }]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, UsersService, JwtService],
  exports: [InvoicesService]
})
export class InvoicesModule { }
