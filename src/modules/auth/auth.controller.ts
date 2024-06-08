import { Controller, Post, UseGuards, Body, HttpException, Req, Get } from "@nestjs/common"
import { LocalGuard, RefreshJwtAuthGuard, JwtAuthGuard } from "src/common/guards"
import { AuthService } from "./auth.service"
import { LoginPayloadDto } from "./dto"


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Body() authPayloadDto: LoginPayloadDto) {
        const { accessToken, refreshToken } = await this.authService.login(authPayloadDto)
        if (!accessToken || !refreshToken) {
            throw new HttpException('Invalid credentials', 401)
        }
        return { accessToken, refreshToken }
    }

    @Post('refreshToken')
    @UseGuards(RefreshJwtAuthGuard)
    async refreshToken(@Req() req) {
        console.log(req)
        const { accessToken } = await this.authService.refreshToken(req.user)
        if (!accessToken) {
            throw new HttpException('Invalid credentials', 401)
        }
        return { accessToken }
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req) {
        console.log(req.user);
    }

}
