import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CurrencyController } from "./currencies.controller";
import { CurrencyService } from "./currencies.service";


@Module({
  imports: [HttpModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule { }
