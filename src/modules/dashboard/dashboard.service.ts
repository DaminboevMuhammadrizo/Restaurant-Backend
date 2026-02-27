import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { PrismaService } from 'src/common/Database/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllStatus(currentUser: JwtPayload) {
        const compId = currentUser.companyId!;

        const [totalUsers, totalBranches, totalManagers, firstOrder] = await Promise.all([
            this.prisma.user.count({ where: { companyId: compId } }),
            this.prisma.branch.count({ where: { companyId: compId } }),
            this.prisma.user.count({ where: { role: UserRole.MANAGER, companyId: compId } }),
            this.prisma.order.findFirst({ where: { branch: { companyId: compId } }, orderBy: { createdAt: 'asc' } })
        ]);

        const items = await this.prisma.orderItem.findMany({
            where: { status: OrderStatus.SUCCESS, branch: { companyId: compId } },
            include: { product: true }
        });

        const totalPrice = items.reduce((acc, item) => { return acc + (item.count * Number(item.product.price ?? 0)) }, 0);
        const daysActive = firstOrder ? Math.ceil((new Date().getTime() - firstOrder.createdAt.getTime()) / (1000 * 3600 * 24)) : 1;

        return {
            totalUsers,
            totalBranches,
            totalManagers,
            totalRevenue: totalPrice,
            averageDailyRevenue: totalPrice / (daysActive || 1)
        };
    }


    async getFinance(currentUser: JwtPayload, filter: string, from?: string, to?: string) {
        const compId = currentUser.companyId!;

        let startDate = new Date();
        let endDate = new Date();

        switch (filter) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last7':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'last30':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'custom':
                if (from && to) {
                    startDate = new Date(from);
                    endDate = new Date(to);
                }
                break;
        }

        const items = await this.prisma.orderItem.findMany({
            where: {
                status: OrderStatus.SUCCESS,
                branch: { companyId: compId },
                createdAt: { gte: startDate, lte: endDate }
            },
            include: { product: true },
            orderBy: { createdAt: 'asc' }
        });

        const dailyData: Record<string, number> = {};

        items.forEach(item => {
            const dateKey = item.createdAt.toISOString().split('T')[0]; // "2024-05-20" formatida
            const itemTotal = item.count * (Number(item.product.price ?? 0));

            if (!dailyData[dateKey]) {
                dailyData[dateKey] = 0;
            }
            dailyData[dateKey] += itemTotal;
        });

        const chartData = Object.keys(dailyData).map(date => ({
            date,
            daromad: dailyData[date],
            xarajat: 0
        }));

        const totalRevenue = chartData.reduce((sum, item) => sum + item.daromad, 0);

        return {
            summary: {
                totalRevenue,
                totalExpense: 0,
                totalProfit: totalRevenue
            },
            chart: chartData
        };
    }


    async getRevenueChart(user: JwtPayload, filter: string, from?: string, to?: string) {
        if (!user.companyId) throw new ForbiddenException('Company not found');

        let startDate: Date;
        let endDate: Date = new Date();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'today':
                startDate = new Date(today);
                break;

            case 'yesterday':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date(today);
                break;

            case 'last7':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 7);
                break;

            case 'last30':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 30);
                break;

            case 'custom':
                if (!from || !to) {
                    throw new BadRequestException('from and to dates are required for custom filter');
                }
                startDate = new Date(from);
                endDate = new Date(to);
                break;

            default:
                throw new BadRequestException('Invalid filter type');
        }

        const branches = await this.prisma.branch.findMany({
            where: { companyId: user.companyId },
            select: { id: true }
        });

        const branchIds = branches.map(b => b.id);
        const orders = await this.prisma.orderItem.findMany({
            where: {
                branchId: { in: branchIds },
                status: OrderStatus.SUCCESS,
                createdAt: { gte: startDate, lte: endDate }
            },
            include: { product: true }
        });

        const costs = await this.prisma.costs.findMany({
            where: {
                branchId: { in: branchIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        const resultMap: Record<string, { revenue: number; expense: number }> = {};

        for (const order of orders) {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            const revenue = order.count * Number(order.product?.price ?? 0);

            if (!resultMap[dateKey]) resultMap[dateKey] = { revenue: 0, expense: 0 };
            resultMap[dateKey].revenue += revenue;
        }

        for (const cost of costs) {
            const dateKey = cost.createdAt.toISOString().split('T')[0];
            const expense = Number(cost.costAmount ?? 0) * cost.quantity;

            if (!resultMap[dateKey]) resultMap[dateKey] = { revenue: 0, expense: 0 };
            resultMap[dateKey].expense += expense;
        }

        return Object.entries(resultMap)
            .map(([date, values]) => ({
                date,
                revenue: values.revenue,
                expense: values.expense
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
}
