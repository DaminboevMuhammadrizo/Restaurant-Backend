import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoomCategoryService } from './room-category.service';
import { CreateRoomCategoryDto } from './dto/carete.dto';
import { UpdateRoomcategoryDto } from './dto/update.dto';

@Controller('room-category')
export class RoomCategoryController {

    constructor(private readonly service: RoomCategoryService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('all/:branchId')
    getAllForManager(@Param('branchId', ParseUUIDPipe) branchId: string, @Req() req: Request) {
        return this.service.getAllForManager(branchId, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('all')
    getAll(@Req() req: Request) {
        return this.service.getAll(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreateRoomCategoryDto, @Req() req: Request) {
        return this.service.craete(payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateRoomcategoryDto,
        @Req() req: Request
    ) {
        return this.service.update(id, payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch('satus/:id')
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.service.updateStatus(id, req['user'])
    }
}
