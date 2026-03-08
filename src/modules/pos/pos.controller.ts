import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CreatePosDto } from './dto/create.dto';
import { UpdatePosDto } from './dto/update.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Pos Terminal (Kassa)')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('pos-terminal')
export class PosController {
    constructor(private readonly posService: PosService) { }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get()
    findAll(@Req() req: Request) {
        return this.posService.findAll(req['user']);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.posService.findOne(id, req['user']);
    }

    @ApiOperation({ summary: `${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.KASSA)
    @Get('my-terminal')
    getMyTerminal(@Req() req: Request) {
        return this.posService.findMyBranchPos(req['user']);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(@Body() payload: CreatePosDto, @Req() req: Request) {
        return this.posService.create(payload, req['user']);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdatePosDto, @Req() req: Request) {
        return this.posService.update(id, payload, req['user']);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch('status/:id')
    toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.posService.toggleStatus(id, req['user']);
    }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @Roles(UserRole.SUPERADMIN)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.posService.remove(id, req['user']);
    }
}
