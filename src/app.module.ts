import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './common/Database/prisma.module';
import { ConfgModule } from './common/config/config.module';
import { CoreModule } from './common/core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeaderModule } from './common/seeders/seader.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        PrismaModule,
        SeaderModule,
        ConfgModule,
        CoreModule,
        AuthModule
    ],
})
export class AppModule { }
