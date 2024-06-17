import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../modules/users";
import { Claims } from "../consts";

@Injectable()
export class ClaimsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private userService: UsersService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredClaims = this.reflector.get<string[]>('claims', context.getHandler());
        if (!requiredClaims) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization.split(' ')[1];
        const decoded = this.jwtService.decode(token) as any;

        const user = await this.userService.findOne(decoded._doc);

        if (user.claims.includes(Claims.MANAGE)) return true;

        else if (!user || !requiredClaims.every(claim => user.claims.includes(claim))) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}