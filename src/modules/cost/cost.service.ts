import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/common/Database/prisma.service";
import { CostQueryDto } from "./dto/query.dto";
import { JwtPayload } from "src/common/config/jwt/jwt.service";
import { CreateCostDto } from "./dto/create-cost.dto";
import { UpdateCostDto } from "./dto/update-cost.dto";
import { DeleteManyCostDto } from "./dto/delete-many-cost.dto";
import { AnalyticsQueryDto, DateFilter } from "./dto/analytics-query.dto";
import { OrderStatus } from "@prisma/client";
import { BranchAnalytics } from "./types/types";

@Injectable()
export class CostService {

    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, user: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException("Branch not found");
        if (branch.companyId !== user.companyId) throw new ForbiddenException("Access Denied");
    }


    private getDateRange(filter?: DateFilter, from?: string, to?: string) {
        const now = new Date();
        let start: Date;
        let end: Date = new Date();

        switch (filter) {
            case 'today':
                start = new Date(now.setHours(0, 0, 0, 0));
                break;

            case 'yesterday':
                start = new Date();
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setHours(23, 59, 59, 999);
                break;

            case 'last7':
                start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;

            case 'last30':
                start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;

            case 'custom':
                start = new Date(from!);
                end = new Date(to!);
                break;

            default:
                start = new Date(0);
        }

        return { start, end };
    }


    private calculateGrowth(current: number, previous: number) {
        if (previous === 0 && current === 0) return '0%';
        if (previous === 0) return '+100%';

        const percent = ((current - previous) / previous) * 100;

        return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;

    }


    async getAll(branchId: string, query: CostQueryDto, user: JwtPayload) {
        await this.checkBranch(branchId, user);

        const { search, costsCategoryId, page = 1, limit = 10 } = query;
        const where: any = { branchId };

        if (search) where.name = { contains: search, mode: "insensitive" };
        if (costsCategoryId) where.costsCategoryId = costsCategoryId;

        const data = await this.prisma.costs.findMany({
            where,
            skip: (page - 1) * Number(limit),
            take: Number(limit),
            include: { costsCategory: true }
        });

        const totalExpense = data.reduce((sum, c) => sum + Number(c.costAmount ?? 0) * c.quantity, 0);
        return { totalExpense, data };
    }


    async analyticsByBranch(branchId: string, user: JwtPayload) {

        await this.checkBranch(branchId, user);

        const orders = await this.prisma.orderItem.findMany({
            where: { branchId, status: "SUCCESS" },
            include: { product: true }
        });

        const income = orders.reduce((sum, o) => sum + o.count * Number(o.product.price), 0);
        const expenses = await this.prisma.costs.findMany({ where: { branchId } });

        const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.costAmount ?? 0) * e.quantity, 0);
        const total = income + expenseTotal;

        return {
            totalIncome: income,
            totalExpense: expenseTotal,
            incomePercent: total ? (income / total) * 100 : 0,
            expensePercent: total ? (expenseTotal / total) * 100 : 0,
            profit: income - expenseTotal
        };
    }


    async analytics(user: JwtPayload, query: AnalyticsQueryDto) {

        if (!user.companyId) throw new ForbiddenException('Company not found');
        const { start, end } = this.getDateRange(query.filter, query.from, query.to);

        const diff = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - diff);
        const prevEnd = new Date(end.getTime() - diff);

        const branches = await this.prisma.branch.findMany({ where: { companyId: user.companyId } });
        const branchResults: BranchAnalytics[] = [];

        let totalIncome = 0;
        let totalExpense = 0;

        for (const branch of branches) {

            const orders = await this.prisma.orderItem.findMany({
                where: {
                    branchId: branch.id,
                    status: OrderStatus.SUCCESS,
                    createdAt: { gte: start, lte: end }
                },
                include: { product: true }
            });

            const income = orders.reduce(
                (sum, o) => sum + o.count * Number(o.product?.price ?? 0),
                0
            );

            const expenses = await this.prisma.costs.findMany({
                where: {
                    branchId: branch.id,
                    createdAt: { gte: start, lte: end }
                }
            });

            const expenseTotal = expenses.reduce(
                (sum, e) =>
                    sum + Number(e.costAmount ?? 0) * e.quantity,
                0
            );

            // Previous income
            const prevOrders = await this.prisma.orderItem.findMany({
                where: {
                    branchId: branch.id,
                    status: OrderStatus.SUCCESS,
                    createdAt: { gte: prevStart, lte: prevEnd }
                },
                include: { product: true }
            });

            const prevIncome = prevOrders.reduce(
                (sum, o) => sum + o.count * Number(o.product?.price ?? 0),
                0
            );

            totalIncome += income;
            totalExpense += expenseTotal;

            branchResults.push({
                branchId: branch.id,
                branchName: branch.name,
                income,
                expense: expenseTotal,
                profit: income - expenseTotal,
                growth: this.calculateGrowth(income, prevIncome)
            });
        }

        const total = totalIncome + totalExpense;

        return {
            overall: {
                totalIncome,
                totalExpense,
                profit: totalIncome - totalExpense,
                incomePercent: total ? (totalIncome / total) * 100 : 0,
                expensePercent: total ? (totalExpense / total) * 100 : 0
            },
            branches: branchResults
        };
    }


    async create(payload: CreateCostDto, user: JwtPayload) {
        await this.checkBranch(payload.branchId, user);
        const category = await this.prisma.costsCategory.findUnique({ where: { id: payload.costsCategoryId } });
        if (!category || category.branchId !== payload.branchId) throw new BadRequestException("Invalid Category");
        return this.prisma.costs.create({ data: { ...payload, costAmount: payload.costAmount } });
    }


    async update(id: string, payload: UpdateCostDto, user: JwtPayload) {

        const cost = await this.prisma.costs.findUnique({ where: { id } });
        if (!cost) throw new NotFoundException("Cost not found");

        await this.checkBranch(cost.branchId, user);

        if (payload.costsCategoryId) {
            const category = await this.prisma.costsCategory.findUnique({ where: { id: payload.costsCategoryId } });
            if (!category || category.branchId !== cost.branchId) throw new BadRequestException("Invalid Category");
        }

        return this.prisma.costs.update({ where: { id }, data: payload });
    }


    async deleteOne(id: string, user: JwtPayload) {

        const cost = await this.prisma.costs.findUnique({ where: { id } });
        if (!cost) throw new NotFoundException("Cost not found");

        await this.checkBranch(cost.branchId, user);
        return this.prisma.costs.delete({ where: { id } });
    }


    async deleteMany(payload: DeleteManyCostDto, user: JwtPayload) {

        const costs = await this.prisma.costs.findMany({ where: { id: { in: payload.ids } } });
        if (!costs.length) throw new NotFoundException("Costs not found");

        const branchId = costs[0].branchId;
        await this.checkBranch(branchId, user);

        const invalid = costs.find(c => c.branchId !== branchId);
        if (invalid) throw new ForbiddenException("Mixed branch delete not allowed");
        return this.prisma.costs.deleteMany({ where: { id: { in: payload.ids } } });
    }
}
