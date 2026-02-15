import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('category')
export class CategoryController {
    constructor(private readonly service: CategoryService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}, ${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Get('all')
    getAll(@Req() req: Request) {
        return this.service.getAll(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}, ${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Post()
    create(@Body() payload: any, @Req() req: Request) {
        return this.service.create(payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}, ${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Patch(':id')
    update(
        @Body() payload: any,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.service.update(id, payload, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}, ${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Patch('status/:id')
    updateStatus(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.updateStatus(id, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}, ${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.updateStatus(id, req['user'])
    }
}
