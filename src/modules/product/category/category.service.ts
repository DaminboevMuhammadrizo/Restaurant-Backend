import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Status, UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { PrismaService } from 'src/common/Database/prisma.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { basename, join } from 'path';
import { existsSync, promises as fs } from 'fs';
import { getPathInFileType } from 'src/common/types/generator.types';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllForManager(branchId: string, currnetUser: JwtPayload) {
        await this.checkBranch(branchId, currnetUser)
        return await this.prisma.productCategory.findMany({ where: { branchId } })
    }


    async getAll(currnetUser: JwtPayload) {
        return await this.prisma.productCategory.findMany({ where: { branchId: currnetUser.branchId! } })
    }


    async create(payload: CreateCategoryDto, currnetUser: JwtPayload, file?: Express.Multer.File) {
        await this.checkBranch(payload.branchId, currnetUser)
        return await this.prisma.productCategory.create({
            data: {
                branchId: payload.branchId,
                name: payload.name,
                icon: file?.filename
            }
        })
    }


    async update(id: string, payload: UpdateCategoryDto, currnetUser: JwtPayload, file?: Express.Multer.File) {
        const category = await this.prisma.productCategory.findUnique({ where: { id } })
        if (!category) throw new NotFoundException('Category not found !')
        await this.checkBranch(category.branchId, currnetUser)

        let newIcon = category.icon;

        if (file) {
            if (category.icon) {
                const safeOldName = basename(category.icon);
                const oldPath = join(getPathInFileType(safeOldName), safeOldName);
                if (existsSync(oldPath)) await fs.unlink(oldPath);
            }
            newIcon = file.filename;
        }

        return await this.prisma.productCategory.update({
            where: { id },
            data: {
                ...payload,
                icon: newIcon
            }
        })
    }


    async updateStatus(id: string, currnetUser: JwtPayload) {
        const category = await this.prisma.productCategory.findUnique({ where: { id } })
        if (!category) throw new NotFoundException('Category not found !')
        await this.checkBranch(category.branchId, currnetUser)

        return await this.prisma.productCategory.update({
            where: { id },
            data: { status: category.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })
    }


    async delete(id: string, currentUser: JwtPayload) {
        const category = await this.prisma.productCategory.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Category not found!');
        await this.checkBranch(category.branchId, currentUser);

        if (category.icon) {
            const safeName = basename(category.icon);
            const filePath = join(getPathInFileType(safeName), safeName);
            if (existsSync(filePath)) {
                await fs.unlink(filePath);
            }
        }
        return await this.prisma.productCategory.delete({ where: { id } });
    }
}
