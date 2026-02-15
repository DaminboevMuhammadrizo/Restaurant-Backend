import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { UnitType, UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorages } from 'src/common/types/upload_types';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';


@Controller('product')
export class ProductController {
    constructor(private readonly service: ProductService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('all/manager/:branchId')
    getAllForManager(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Req() req: Request
    ) {
        // return this.service.getAllForManager(branchId, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.CHEF}, ${UserRole.AFITSANT}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CHEF, UserRole.AFITSANT, UserRole.KASSA)
    @Get('all')
    getAll(@Req() req: Request) {
        // return this.service.getAll(req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'price', 'amount', 'unit', 'branchId', 'productCategoryId'],
            properties: {
                name: { type: 'string' },
                desc: { type: 'string' },
                price: { type: 'number' },
                amount: { type: 'number' },
                unit: { type: 'string', enum: Object.values(UnitType) },
                branchId: { type: 'string', format: 'uuid' },
                productCategoryId: { type: 'string', format: 'uuid' },
                photo: { type: 'string', format: 'binary' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('photo', fileStorages(['image'])))
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Post()
    create(
        @Body() payload: CreateProductDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        // return this.service.create(payload, req['user'], file);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [],
            properties: {
                name: { type: 'string' },
                desc: { type: 'string' },
                price: { type: 'number' },
                amount: { type: 'number' },
                unit: {
                    type: 'string',
                    enum: Object.values(UnitType)
                },
                productCategoryId: { type: 'string', format: 'uuid' },
                photo: { type: 'string', format: 'binary' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('photo', fileStorages(['image'])))
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateProductDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        // return this.service.update(id, payload, req['user'], file);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Patch('status/:id')
    toggleStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        // return this.service.toggleStatus(id, req['user']);
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Delete(':id')
    delete(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        // return this.service.delete(id, req['user']);
    }
}
