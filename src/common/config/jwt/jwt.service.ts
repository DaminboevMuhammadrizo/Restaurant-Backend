import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';

export type JwtPayload = {
    id: string;
    role: UserRole
    companyId?: string | null
    branchId?: string | null
};

@Injectable()
export class JwtServices {
    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    private async signToken(payload: JwtPayload, secretKey: string, expiresIn: any): Promise<string> {
        return this.jwt.signAsync(payload, { secret: secretKey, expiresIn });
    }

    async generateAccessToken(user: JwtPayload): Promise<string> {
        const secret = this.config.get<string>('JWT_ACCESS_TOKEN_SECRET', 'access_default_secret');
        const expiresIn = this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN', '10d');

        return this.signToken({ id: user.id, role: user.role, branchId: user.branchId, companyId: user.companyId }, secret, expiresIn);
    }

    async generateRefreshToken(user: JwtPayload): Promise<string> {
        const secret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET', 'refresh_default_secret');
        const expiresIn = this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN', '30d');

        return this.signToken({ id: user.id, role: user.role, branchId: user.branchId, companyId: user.companyId },
            secret,
            expiresIn,
        );
    }
}
