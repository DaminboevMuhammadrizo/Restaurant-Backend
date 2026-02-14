import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetAllComapnyQuery } from './dto/getAllCompanyQuery.dto';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorages } from 'src/common/types/upload_types';
import { UpdateCompanyDto } from './dto/update';

@Controller('company')
export class CompanyController {
    constructor(private readonly service: CompanyService) { }

    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Get('all')
    getAll(@Query() query: GetAllComapnyQuery, @Req() req: Request) {
        return this.service.getAll(query, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN},${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.MANAGER)
    @Get('my')
    getMy(@Req() req: Request) {
        return this.service.getMy(req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Get('one/:id')
    getOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        return this.service.getOne(id, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'phone', 'founderName'],
            properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                founderName: { type: 'string' },
                bio: { type: 'string' },
                logo: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('logo', fileStorages(['image'])),
    )
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Post()
    create(
        @Body() payload: CreateCompanyDto,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.service.create(payload, file || null, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                founderName: { type: 'string' },
                bio: { type: 'string' },
                logo: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('logo', fileStorages(['image'])),
    )
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateCompanyDto,
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.service.update(id, payload, file || null, req['user'])
    }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPERADMIN)
    @Delete(':id')
    delete(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.service.delete(id, req['user'])
    }
}
