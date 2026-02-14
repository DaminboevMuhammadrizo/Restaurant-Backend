import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { getAllBranchDto } from './dto/getAll.dto';
import { CreateBranchDto } from './dto/create.dto';
import { UpdateBranchDto } from './dto/update.dto';

@Controller('branch')
export class BranchController {
    constructor(private readonly service: BranchService) { }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Get('all')
    getAll(@Query() query: getAllBranchDto, @Req() req: Request) {
        return this.service.getAll(query, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Get('one/:id')
    getOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.getOne(id, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('my')
    getMy(@Req() req: Request) {
        return this.service.getMy(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreateBranchDto, @Req() req: Request) {
        return this.service.create(payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateBranchDto,
        @Req() req: Request
    ) {
        return this.service.update(id, payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.delete(id, req['user'])
    }
}
