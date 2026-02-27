import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtPayload } from "src/common/config/jwt/jwt.service";
import { CostCategoryQueryDto } from "./dto/query.dto";
import { PrismaService } from "src/common/Database/prisma.service";
import { DeleteManyCostCategoryDto } from "./dto/delete-many-cost-category.dto";
import { CreateCostCategoryDto } from "./dto/create-cost-category.dto";
import { UpdateCostCategoryDto } from "./dto/update-cost-category.dto";

@Injectable()
export class CostCategoryService {

    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, user: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException('Branch not found');
        if (branch.companyId !== user.companyId)
            throw new ForbiddenException('Access Denied');
    }


    private getDateRange(filter?: string, from?: string, to?: string) {
        const now = new Date();
        let start: Date | undefined;
        let end: Date | undefined;

        if (filter === 'today') {
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date();
        }

        if (filter === 'yesterday') {
            start = new Date();
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
        }

        if (filter === 'last7')
            start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (filter === 'last30')
            start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        if (filter === 'custom' && from && to) {
            start = new Date(from);
            end = new Date(to);
        }

        return start ? { gte: start, lte: end ?? new Date() } : undefined;
    }


    async getAll(branchId: string, query: CostCategoryQueryDto, user: JwtPayload) {

        await this.checkBranch(branchId, user);

        const { search, page = 1, limit = 10, filter, from, to } = query;

        const where: any = { branchId };

        if (search)
            where.name = { contains: search, mode: 'insensitive' };

        const dateRange = this.getDateRange(filter, from, to);
        if (dateRange)
            where.createdAt = dateRange;

        const data = await this.prisma.costsCategory.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: { cost: true }
        });

        const totalCost = data.reduce((sum, c) =>
            sum + c.cost.reduce((s, i) => s + Number(i.costAmount ?? 0), 0), 0);

        return { totalCost, data };
    }


    async create(payload: CreateCostCategoryDto, user: JwtPayload) {
        await this.checkBranch(payload.branchId, user);
        return this.prisma.costsCategory.create({ data: payload });
    }


    async update(id: string, payload: UpdateCostCategoryDto, user: JwtPayload) {
        const category = await this.prisma.costsCategory.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Not found');

        await this.checkBranch(category.branchId, user);
        return this.prisma.costsCategory.update({ where: { id }, data: payload });
    }


    async deleteOne(id: string, user: JwtPayload) {
        const category = await this.prisma.costsCategory.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Not found');

        await this.checkBranch(category.branchId, user);
        return this.prisma.costsCategory.delete({ where: { id } });
    }


    async deleteMany(branchId: string, payload: DeleteManyCostCategoryDto, user: JwtPayload) {

        await this.checkBranch(branchId, user);
        return this.prisma.costsCategory.deleteMany({
            where: { branchId, id: { in: payload.ids } }
        });
    }
}
