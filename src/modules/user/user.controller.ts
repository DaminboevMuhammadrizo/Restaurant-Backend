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
    @Delete('manager/:id')
    deleteManager(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteManager(id)
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    createUser() { }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    updateUser() { }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Delete(':id')
    deleteUser() { }
}
