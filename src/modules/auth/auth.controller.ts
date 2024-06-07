import { Body, Controller, Get, HttpException, Post, Req, UseGuards } from '@nestjs/common';
import { LoginPayloadDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from '../../common/guards/local.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('login')
    @UseGuards(LocalGuard)
    login(@Body() authPayloadDto: LoginPayloadDto) {
        const token = this.authService.login(authPayloadDto)
        if (!token) {
            throw new HttpException('Invalid credentials', 401)
        }
        return { token }
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req: Request) {
        console.log(req.user);
    }

}
