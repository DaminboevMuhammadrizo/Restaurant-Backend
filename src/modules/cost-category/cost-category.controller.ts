import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CostCategoryService } from './cost-category.service';
import { CostCategoryQueryDto } from './dto/query.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto';
import { DeleteManyCostCategoryDto } from './dto/delete-many-cost-category.dto';

@Controller('cost-category')
export class CostCategoryController {

    constructor(private readonly service: CostCategoryService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get(':branchId')
    getAll(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query() query: CostCategoryQueryDto,
        @Req() req: Request
    ) {
        return this.service.getAll(branchId, query, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreateCostCategoryDto, @Req() req: Request) {
        return this.service.create(payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(@Param('id') id: string, @Body() payload: UpdateCostCategoryDto, @Req() req: Request) {
        return this.service.update(id, payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Delete(':id')
    deleteOne(@Param('id') id: string, @Req() req: Request) {
        return this.service.deleteOne(id, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post('delete-many/:branchId')
    deleteMany(
        @Param('branchId') branchId: string,
        @Body() payload: DeleteManyCostCategoryDto,
        @Req() req: Request
    ) {
        return this.service.deleteMany(branchId, payload, req['user']);
    }
}
