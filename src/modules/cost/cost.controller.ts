import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CostService } from './cost.service';
import { CostQueryDto } from './dto/query.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { DeleteManyCostDto } from './dto/delete-many-cost.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('cost')
export class CostController {

    constructor(private readonly service: CostService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get(':branchId')
    getAll(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query() query: CostQueryDto,
        @Req() req: Request
    ) {
        return this.service.getAll(branchId, query, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('analytics/:branchId')
    analyticsByBranch(@Param('branchId', ParseUUIDPipe) branchId: string, @Req() req: Request) {
        return this.service.analyticsByBranch(branchId, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('main/analytics')
    analytics(@Req() req: Request, @Query() query: CostQueryDto) {
        return this.service.analytics(req['user'], query);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreateCostDto, @Req() req: Request) {
        return this.service.create(payload, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(@Param('id') id: string, @Body() payload: UpdateCostDto, @Req() req: Request) {
        return this.service.update(id, payload, req['user']);
    }


    // @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    // @ApiBearerAuth()
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    // @Delete(':id')
    // deleteOne(@Param('id') id: string, @Req() req: Request) {
    //     return this.service.deleteOne(id, req['user']);
    // }


    // @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    // @ApiBearerAuth()
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    // @Post('delete-many')
    // deleteMany(@Body() payload: DeleteManyCostDto, @Req() req: Request) {
    //     return this.service.deleteMany(payload, req['user']);
    // }
}
