import { Module } from '@nestjs/common';
import { ProductsController } from './controllers';
import { ProductsService } from './services';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
