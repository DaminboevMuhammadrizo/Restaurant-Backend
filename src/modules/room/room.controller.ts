import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateRoomDto } from './dto/create.dto';
import { UpdateRoomDto } from './dto/update.dto';


@Controller('room')
export class RoomController {
    constructor(private readonly service: RoomService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @ApiQuery({ name: 'roomCategoryId', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @Get('all/:branchId')
    getAllFormanager(
        @Req() req: Request,
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query('roomCategoryId') roomCategoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.service.getAllFormanager(branchId, req['user'], roomCategoryId, search);
    }


    @ApiOperation({ summary: `${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @ApiQuery({ name: 'roomCategoryId', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA)
    @Get('all')
    getAll(
        @Req() req: Request,
        @Query('roomCategoryId') roomCategoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.service.getAll(req['user'], roomCategoryId, search);
    }



    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreateRoomDto, @Req() req: Request) {
        return this.service.create(payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateRoomDto,
        @Req() req: Request
    ) {
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
}
