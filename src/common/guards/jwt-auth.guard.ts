
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let token = this.extractTokenFromHeader(request)

        if (!token) throw new UnauthorizedException()

        try {
            const secret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
            let payload = await this.jwtService.verifyAsync(token, { secret })
            request['user'] = payload
            return true
        } catch (error) {
            throw new UnauthorizedException()
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        let [type, token] = request.headers.authorization?.split(" ") || []

        return type == 'Bearer' ? token : undefined
    }
}
