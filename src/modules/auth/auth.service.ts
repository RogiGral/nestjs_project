import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginPayloadDto } from "./dto";

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private usersService: UsersService) { }

    async validateUser({ username, password }: LoginPayloadDto): Promise<any> {
        const userFromDB = await this.usersService.findByUsername(username);
        if (!userFromDB) return null;
        if (password === userFromDB.password) {
            const { password, ...user } = userFromDB;
            return { user };
        }
        return null;
    }

    async login({ username, password }: LoginPayloadDto): Promise<any> {
        const userFromDB = await this.usersService.findByUsername(username);
        if (!userFromDB) return null;
        if (password === userFromDB.password) {
            const { password, ...user } = userFromDB;
            return {
                accessToken: this.jwtService.sign(user),
                refreshToken: this.jwtService.sign(user, { expiresIn: '1d' }),
            };
        }
        return null;
    }

    async refreshToken({ username }: LoginPayloadDto): Promise<any> {
        const userFromDB = await this.usersService.findByUsername(username);
        if (userFromDB) {
            const { password, ...user } = userFromDB;
            return {
                accessToken: this.jwtService.sign(user),
            };
        }
        return null;
    }

}
