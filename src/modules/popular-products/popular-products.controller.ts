import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PopularProductsService } from './popular-products.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreatePopularProductDto } from './dto/create.dto';

@Controller('popular-products')
export class PopularProductsController {
    constructor(private readonly service: PopularProductsService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('all/manager/:branchId')
    getAllForManager(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Req() req: Request
    ) {
        return this.service.getAllForManager(branchId, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}, ${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_AFITSANT, UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA)
    @Get('all')
    getAll(@Req() req: Request) {
        return this.service.getAll(req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreatePopularProductDto, @Req() req: Request) {
        return this.service.create(payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch('status/:id')
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.service.updateStatus(id, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Delete(':id')
    delete(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.service.delete(id, req['user']);
    }
}
