import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { getAllusersQuery } from './dto/getAll.dto';
import { getUsersMeQuery } from './dto/get-me-users.dto';
import { CreteManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { CreteUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto copy';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Get('managaer')
    getAllManagers(@Query() query: getAllusersQuery) {
        return this.service.getAllManagers(query)
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('my/:branchId')
    getMyUsers(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query() query: getUsersMeQuery,
        @Req() req: Request
    ) {
        return this.service.getMyUsers(branchId, query, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_AFITSANT)
    @Get('waiters')
    getWaiters(
        @Req() req: Request
    ) {
        return this.service.getWaiters(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Post('manager')
    createManager(@Body() payload: CreteManagerDto) {
        return this.service.createManager(payload)
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Patch('manager/:id')
    updateManager(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateManagerDto) {
        return this.service.updateManager(id, payload)
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Patch('manager/status/:id')
    toggleManager(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.toggleManager(id)
    }


    @ApiOperation({ summary: `${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @Post()
    createUser(@Body() payload: CreteUserDto, @Req() req: Request) {
        return this.service.createUser(payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @Patch(':id')
    updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateUserDto, @Req() req: Request) {
        return this.service.updateUser(id, payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @Patch('status/:id')
    toggleUser(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.toggleUser(id, req['user'])
    }
}
