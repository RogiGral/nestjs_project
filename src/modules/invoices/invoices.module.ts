import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers';
import { InvoicesService } from './services';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceEntity, InvoiceSchema } from 'src/entitities';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InvoiceEntity.name, schema: InvoiceSchema }]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, JwtService],
  exports: [InvoicesService]
})
export class InvoicesModule { }
