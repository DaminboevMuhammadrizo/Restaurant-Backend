import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { KitchenService } from './kitchen.service';
import { CreateKitchenDto } from './dto/crate.dto';
import { UpdateKitchenDto } from './dto/update.dto';

@Controller('kitchen')
export class KitchenController {
    constructor(private readonly service: KitchenService) { }


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
    create(@Body() payload: CreateKitchenDto, @Req() req: Request) {
        return this.service.create(payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateKitchenDto, @Req() req: Request) {
        return this.service.update(id, payload, req['user']);
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
