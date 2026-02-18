import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Status, UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { PrismaService } from 'src/common/Database/prisma.service';
import { basename, join } from 'path';
import { existsSync, promises as fs } from 'fs';
import { getPathInFileType } from 'src/common/types/generator.types';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { GetProductDto } from './dto/get.dto';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    private async checkCategory(categoryId: string, currentUser: JwtPayload) {
        const category = await this.prisma.productCategory.findUnique({ where: { id: categoryId } });
        if (!category || category.status !== Status.ACTIVE) throw new NotFoundException("Category not found!");
        await this.checkBranch(category.branchId, currentUser);
    }


    async getAllForManager(branchId: string, currentUser: JwtPayload, query: GetProductDto) {
        await this.checkBranch(branchId, currentUser);

        const where: any = { branchId, status: Status.ACTIVE };
        if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
        if (query.categoryId) where.productCategoryId = query.categoryId;

        const skip = ((query.page || 1) - 1) * (query.limit || 10);
        const take = query.limit || 10;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({ where, skip, take }),
            this.prisma.product.count({ where })
        ]);

        return { data, total, page: query.page || 1, limit: query.limit || 10 };
    }


    async getAll(currentUser: JwtPayload, query: GetProductDto) {
        const where: any = { branchId: currentUser.branchId!, status: Status.ACTIVE };
        if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
        if (query.categoryId) where.productCategoryId = query.categoryId;

        const skip = ((query.page || 1) - 1) * (query.limit || 10);
        const take = query.limit || 10;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({ where, skip, take }),
            this.prisma.product.count({ where })
        ]);

        return { data, total, page: query.page || 1, limit: query.limit || 10 };
    }



    async create(payload: CreateProductDto, currentUser: JwtPayload, file?: Express.Multer.File) {
        await this.checkBranch(payload.branchId, currentUser);
        await this.checkCategory(payload.productCategoryId, currentUser);
        return await this.prisma.product.create({
            data: {
                branchId: payload.branchId,
                productCategoryId: payload.productCategoryId,
                name: payload.name,
                desc: payload.desc,
                price: payload.price,
                amount: payload.amount,
                unit: payload.unit,
                photo: file?.filename
            }
        });
    }


    async update(id: string, payload: UpdateProductDto, currentUser: JwtPayload, file?: Express.Multer.File) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found!');
        await this.checkBranch(product.branchId, currentUser);

        if (payload.productCategoryId)
            await this.checkCategory(payload.productCategoryId, currentUser);

        let newPhoto = product.photo;
        if (file) {
            if (product.photo) {
                const safeOldName = basename(product.photo);
                const oldPath = join(getPathInFileType(safeOldName), safeOldName);
                if (existsSync(oldPath)) await fs.unlink(oldPath);
            }
            newPhoto = file.filename;
        }

        return await this.prisma.product.update({
            where: { id },
            data: {
                ...payload,
                photo: newPhoto
            }
        });
    }


    async toggleStatus(id: string, currentUser: JwtPayload) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found!');
        await this.checkBranch(product.branchId, currentUser);

        return await this.prisma.product.update({
            where: { id },
            data: { status: product.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        });
    }


    async delete(id: string, currentUser: JwtPayload) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found!');
        await this.checkBranch(product.branchId, currentUser);

        if (product.photo) {
            const safeOldName = basename(product.photo);
            const oldPath = join(getPathInFileType(safeOldName), safeOldName);
            if (existsSync(oldPath)) await fs.unlink(oldPath);
        }

        return await this.prisma.product.delete({ where: { id } });
    }
}
