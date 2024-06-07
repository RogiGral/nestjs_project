import { Injectable } from '@nestjs/common';
import { LoginPayloadDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

const fakeUsers = [
    {
        id: 1,
        username: 'igor',
        email: 'igor@gmail.com',
        password: 'password321'
    },
    {
        id: 1,
        username: 'robert',
        email: 'robert@gmail.com',
        password: 'password123'
    }
]

@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService) { }

    login({ username, password }: LoginPayloadDto) {
        const findUser = fakeUsers.find((user) => user.username === username)
        if (!findUser) return null;
        if (password === findUser.password) {
            const { password, ...user } = findUser
            return this.jwtService.sign(user)
        }
    }
}
