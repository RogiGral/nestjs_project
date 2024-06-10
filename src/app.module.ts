import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./modules/auth";
import { CurrencyModule } from "./modules/currencies";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./modules/users";


@Module({
  providers: [AppService],
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs'),
    AuthModule,
    CurrencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    UsersModule],
})
export class AppModule { }
