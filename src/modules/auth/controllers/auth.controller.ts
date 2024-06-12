import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpException,
  Req,
} from '@nestjs/common';
import { LoginPayloadDto } from '../dto';
import { AuthService } from '../services';
import { LocalGuard, RefreshJwtAuthGuard } from '../../../common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Body() loginPayloadDto: LoginPayloadDto) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginPayloadDto);
    if (!accessToken || !refreshToken) {
      throw new HttpException('Invalid credentials', 401);
    }
    return { accessToken, refreshToken };
  }

  @Post('refreshToken')
  @UseGuards(RefreshJwtAuthGuard)
  async refreshToken(@Req() req) {
    console.log(req);
    const { accessToken } = await this.authService.refreshToken(req.user);
    if (!accessToken) {
      throw new HttpException('Invalid credentials', 401);
    }
    return { accessToken };
  }
}
