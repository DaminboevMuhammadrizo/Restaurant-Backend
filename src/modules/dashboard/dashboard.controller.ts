import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly service: DashboardService) { }

    @ApiOperation({ summary: `Statistikalarni olish: ${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPERADMIN)
    @Get('status')
    async getAllStatus(@Req() req: Request) {
        return this.service.getAllStatus(req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @ApiQuery({ name: "filter", required: true, enum: ["yesterday", "today", "last7", "last30", "custom"] })
    @ApiQuery({ name: "from", required: false, type: String })
    @ApiQuery({ name: "to", required: false, type: String })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPERADMIN)
    @Get('finance')
    async getFinance(
        @Query('filter') filter: string,
        @Query('from') from: string,
        @Query('to') to: string,
        @Req() req: Request
    ) {
        return await this.service.getFinance(req['user'], filter, from, to);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPERADMIN)
    @ApiQuery({ name: "filter", required: true, enum: ["yesterday", "today", "last7", "last30", "custom"] })
    @ApiQuery({ name: "from", required: false, type: String })
    @ApiQuery({ name: "to", required: false, type: String })
    @Get('revenue')
    getRevenue(
        @Req() req: Request,
        @Query('filter') filter: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.service.getRevenueChart(req['user'], filter, from, to);
    }
}
