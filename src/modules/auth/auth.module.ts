import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModules } from 'src/common/config/jwt/jwt.module';

@Module({
    imports: [JwtModules],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }
