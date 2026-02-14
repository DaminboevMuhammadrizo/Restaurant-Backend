import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { compirePassword } from 'src/common/config/bcrypt';
import { JwtPayload, JwtServices } from 'src/common/config/jwt/jwt.service';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtServices) { }


    async login(payload: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { phoneNumer: payload.identifier } })
        if (!user)
            throw new UnauthorizedException('Invalid login or password !')

        const deshif = await compirePassword(payload.password, user.password)
        if (!deshif)
            throw new UnauthorizedException('Invalid login or password !')

        const jwtPayload: JwtPayload = {
            id: user.id,
            role: user.role,
            companyId: user.companyId,
            branchId: user.branchId,
        };

        return {
            accessToken: await this.jwtService.generateAccessToken(jwtPayload),
            refreshToken: await this.jwtService.generateRefreshToken(jwtPayload),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
                updateAt: user.updatedAt,
            }
        };
    }
}
