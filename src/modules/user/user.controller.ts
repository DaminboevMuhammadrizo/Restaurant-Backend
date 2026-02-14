import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { getAllusersQuery } from './dto/getAll.dto';
import { getUsersMeQuery } from './dto/get-me-users.dto';

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


    @ApiOperation({ summary: `${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @Get('my/:branchId')
    getMyUsers(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query() query: getUsersMeQuery,
        @Req() req: Request
    ) {
        return this.service.getMyUsers(branchId, query, req['user'])
    }
}
