import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status } from '@prisma/client';
import { CreatePopularProductDto } from './dto/create.dto';

@Injectable()
export class PopularProductsService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException('Branch not found!');
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException('Access Denied!');
    }


    private async checkProduct(productId: string, branchId: string) {
        const product = await this.prisma.product.findFirst({ where: { id: productId, branchId } });
        if (!product || product.status !== Status.ACTIVE) throw new BadRequestException('Product not found or inactive!');
    }


    async getAllForManager(branchId: string, currentUser: JwtPayload) {
        await this.checkBranch(branchId, currentUser);

        return await this.prisma.popularProducts.findMany({
            where: { branchId },
            include: { product: true }
        });
    }


    async getAll(currentUser: JwtPayload) {
        if (!currentUser.branchId) throw new ForbiddenException('Branch not found in token');

        return await this.prisma.popularProducts.findMany({
            where: { branchId: currentUser.branchId, status: Status.ACTIVE },
            include: { product: true }
        });
    }


    async create(payload: CreatePopularProductDto, currentUser: JwtPayload) {
        await this.checkBranch(payload.branchId, currentUser);
        await this.checkProduct(payload.productId, payload.branchId);
        return await this.prisma.popularProducts.create({ data: payload });
    }


    async updateStatus(id: string, currentUser: JwtPayload) {
        const popular = await this.prisma.popularProducts.findUnique({ where: { id } });
        if (!popular) throw new NotFoundException('Popular product not found!');
        await this.checkBranch(popular.branchId, currentUser);

        return await this.prisma.popularProducts.update({
            where: { id },
            data: { status: popular.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        });
    }


    async delete(id: string, currentUser: JwtPayload) {
        const popular = await this.prisma.popularProducts.findUnique({ where: { id } });
        if (!popular) throw new NotFoundException('Popular product not found');
        await this.checkBranch(popular.branchId!, currentUser);
        return await this.prisma.popularProducts.delete({ where: { id } });
    }
}
