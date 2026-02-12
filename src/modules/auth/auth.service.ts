import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { compirePassword } from 'src/common/config/bcrypt';
import { JwtServices } from 'src/common/config/jwt/jwt.service';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtServices) { }


    async login(payload: LoginDto) {

    }
}
