import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/Database/prisma.module';
import { ConfgModule } from './common/config/config.module';
import { CoreModule } from './common/core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeaderModule } from './common/seeders/seader.module';
import { UserModule } from './modules/user/user.module';
import { JwtModules } from './common/config/jwt/jwt.module';
import { JwtModule } from '@nestjs/jwt';
import { CompanyModule } from './modules/company/company.module';
import { BranchModule } from './modules/branch/branch.module';
import { ProductModule } from './modules/product/product.module';
import { RoomModule } from './modules/room/room.module';
import { PopularProductsModule } from './modules/popular-products/popular-products.module';
import { OrderModule } from './modules/order/order.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { SessionModule } from './common/session/session.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CostCategoryModule } from './modules/cost-category/cost-category.module';
import { CostModule } from './modules/cost/cost.module';
import { PrinterModule } from './infra/printer/printer.module';
import { PosModule } from './modules/pos/pos.module';

@Module({
    imports: [
        PrismaModule,
        SeaderModule,
        ConfgModule,
        CoreModule,
        AuthModule,
        DashboardModule,
        CompanyModule,
        BranchModule,
        UserModule,
        JwtModules,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            ignoreEnvFile: false,
        }),
        ConfigModule,
        JwtModule.register({ global: true }),
        ProductModule,
        RoomModule,
        PopularProductsModule,
        OrderModule,
        KitchenModule,
        SessionModule,
        CostCategoryModule,
        CostModule,
        PrinterModule,
        PosModule,
    ],
})
export class AppModule { }
