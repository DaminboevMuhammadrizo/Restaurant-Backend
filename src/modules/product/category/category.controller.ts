import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorages } from 'src/common/types/upload_types';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
    constructor(private readonly service: CategoryService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('all/manager/:branchId')
    getAllForManager(@Param('branchId', ParseUUIDPipe) branchId: string, @Req() req: Request) {
        return this.service.getAllForManager(branchId, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Get('all')
    getAll(@Req() req: Request) {
        return this.service.getAll(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'branchId'],
            properties: {
                name: { type: 'string' },
                branchId: { type: 'string' },
                icon: { type: 'string', format: 'binary' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('icon', fileStorages(['image'])))
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(
        @Body() payload: CreateCategoryDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.service.create(payload, req['user'], file)
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: [],
            properties: {
                name: { type: 'string' },
                icon: { type: 'string', format: 'binary' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('icon', fileStorages(['image'])))
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(
        @Body() payload: UpdateCategoryDto,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.service.update(id, payload, req['user'], file)
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch('status/:id')
    updateStatus(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.updateStatus(id, req['user'])
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
