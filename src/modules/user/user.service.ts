import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { getAllusersQuery } from './dto/getAll.dto';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { OrderStatus, Prisma, Status, UserRole } from '@prisma/client';
import { getUsersMeQuery } from './dto/get-me-users.dto';
import { CreteManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { hashPassword } from 'src/common/config/bcrypt';
import { CreteUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto copy';
import { Filter } from 'src/common/types/date';
import { GetWaitersKpiDto, TimeFilter } from './dto/getWaitersKpi.dto';
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllManagers(query: getAllusersQuery) {
        const { status, search, offcet = 0, limit = 10 } = query;

        const where: any = { role: 'MANAGER', status };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phoneNumer: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: offcet,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, lastName: true, phoneNumer: true, companyId: true, status: true, role: true },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { total, offcet, limit, data };
    }


    async getMyUsers(branchId: string, query: getUsersMeQuery, currentUser: JwtPayload) {
        if (currentUser.role === UserRole.MANAGER) await this.checkBranch(branchId, currentUser);

        const { search, role, offcet = 0, limit = 10 } = query;
        const where: any = { branchId };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { phoneNumer: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role) where.role = role;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: offcet,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumer: true,
                    salary: true,
                    role: true,
                    branchId: true,
                    companyId: true,
                    status: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { total, offcet, limit, data };
    }


    async getWaiters(currentUser: JwtPayload) {
        const where = { branchId: currentUser.branchId!, role: UserRole.AFITSANT, status: Status.ACTIVE };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumer: true,
                    role: true,
                    branchId: true,
                    companyId: true,
                    status: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { total, data };
    }


    async getWaitersInfo(branchId: string, filter: Filter, currentUser: JwtPayload, from?: string, to?: string) {

        if (currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.MANAGER)
            await this.checkBranch(branchId, currentUser);
        else if (currentUser.role === UserRole.KASSA)
            if (currentUser.branchId !== branchId)
                throw new ForbiddenException('Access Denied!');
            else
                throw new ForbiddenException('Access Denied!');

        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date();

        switch (filter) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startDate = new Date(yesterday.setHours(0, 0, 0, 0));
                endDate = new Date(yesterday.setHours(23, 59, 59, 999));
                break;
            case 'last7':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'last30':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'custom':
                if (!from || !to)
                    throw new BadRequestException('Custom filter requires from and to dates');
                startDate = new Date(from);
                endDate = new Date(to);
                break;
            default:
                throw new BadRequestException('Invalid filter');
        }

        const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, select: { kpi: true } });
        const branchKpi = branch?.kpi || 0;

        const waiters = await this.prisma.user.findMany({
            where: {
                branchId,
                role: UserRole.AFITSANT,
                status: Status.ACTIVE,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                salary: true,
            },
        });

        const orders = await this.prisma.order.findMany({
            where: {
                branchId,
                status: OrderStatus.SUCCESS,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                orderItem: {
                    where: { status: OrderStatus.SUCCESS },
                    include: { product: true },
                },
            },
        });

        const result = waiters.map(waiter => {

            const waiterOrders = orders.filter(o => o.userId === waiter.id);

            const totalSumDecimal = waiterOrders.reduce((sum, order) => {
                const orderTotal = order.orderItem.reduce((s, item) => {
                    const count = item.count;
                    const price = item.product?.price ?? new Prisma.Decimal(0);
                    return s.plus(count.mul(price));
                }, new Prisma.Decimal(0));
                return sum.plus(orderTotal);
            }, new Prisma.Decimal(0));

            const totalSum = totalSumDecimal.toNumber();

            const kpiAmount = branchKpi ? totalSumDecimal.mul(branchKpi).div(100).toNumber() : 0;

            return {
                waiterId: waiter.id,
                fullName: `${waiter.firstName} ${waiter.lastName}`,
                salary: waiter.salary,
                totalOrders: waiterOrders.length,
                totalSum,
                kpiPercent: branchKpi,
                kpiAmount,
            };
        });

        return {
            filter,
            from: startDate,
            to: endDate,
            totalWaiters: result.length,
            data: result,
        };
    }


    async getWaitersKpi(branchId: string, query: GetWaitersKpiDto, currentUser: JwtPayload) {
        await this.checkBranch(branchId, currentUser);
        const { search, offset = 0, limit = 10, timeType, fromDate, toDate } = query;

        let start: Date;
        let end: Date = new Date();

        switch (timeType) {
            case TimeFilter.TODAY:
                start = startOfDay(new Date());
                break;
            case TimeFilter.WEEKLY:
                start = startOfWeek(new Date(), { weekStartsOn: 1 });
                break;
            case TimeFilter.CUSTOM:
                start = new Date(fromDate!);
                end = endOfDay(new Date(toDate!));
                break;
            case TimeFilter.MONTHLY:
            default:
                start = startOfMonth(new Date());
                break;
        }

        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { kpi: true }
        });
        const kpiPercent = branch?.kpi ?? 0;

        const waiters = await this.prisma.user.findMany({
            where: {
                branchId,
                role: { in: [UserRole.AFITSANT, UserRole.SUPER_AFITSANT] },
                ...(search && {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { phoneNumer: { contains: search } }
                    ]
                })
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumer: true
            }
        });

        const waiterIds = waiters.map(w => w.id);
        if (!waiterIds.length) return [];

        const ordersGrouped = await this.prisma.order.groupBy({
            by: ['userId'],
            where: {
                branchId,
                status: OrderStatus.SUCCESS,
                userId: { in: waiterIds },
                createdAt: { gte: start, lte: end }
            },
            _count: { id: true }
        });

        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                branchId,
                order: {
                    status: OrderStatus.SUCCESS,
                    userId: { in: waiterIds },
                    createdAt: { gte: start, lte: end }
                },
                status: OrderStatus.SUCCESS
            },
            select: {
                count: true,
                product: { select: { price: true } },
                order: { select: { userId: true } }
            }
        });

        const sumMap: Record<string, Prisma.Decimal> = {};

        for (const item of orderItems) {
            const userId = item.order.userId;
            const count = item.count;
            const price = item.product?.price ?? new Prisma.Decimal(0);
            const itemTotal = count.mul(price);

            if (!sumMap[userId]) sumMap[userId] = new Prisma.Decimal(0);
            sumMap[userId] = sumMap[userId].plus(itemTotal);
        }

        return waiters.map(waiter => {
            const totalOrders = ordersGrouped.find(o => o.userId === waiter.id)?._count.id || 0;
            const totalSumDecimal = sumMap[waiter.id] ?? new Prisma.Decimal(0);

            return {
                ...waiter,
                totalOrders,
                totalSum: totalSumDecimal.toNumber(),
                totalKpi: totalSumDecimal.mul(kpiPercent).div(100).toNumber()
            };
        });
    }


    async createManager(payload: CreteManagerDto) {
        const company = await this.prisma.company.findUnique({ where: { id: payload.companyId } })
        if (!company)
            throw new NotFoundException('Company not found !')

        const existsUser = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
        if (existsUser)
            throw new ConflictException('Phone alredy exists !')

        return await this.prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                phoneNumer: payload.phoneNumer,
                password: await hashPassword(payload.password),
                role: UserRole.MANAGER,
                companyId: payload.companyId
            }
        })
    }


    async updateManager(id: string, payload: UpdateManagerDto) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        if (payload.phoneNumer && existsUser.phoneNumer !== payload.phoneNumer) {
            const existsPhone = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
            if (existsPhone)
                throw new ConflictException('Phone alredy exists !')
        }

        return await this.prisma.user.update({
            where: { id },
            data: {
                firstName: payload.firstName ?? existsUser.firstName,
                lastName: payload.lastName ?? existsUser.lastName,
                phoneNumer: payload.phoneNumer ?? existsUser.phoneNumer,
                password: payload.password ? await hashPassword(payload.password) : existsUser.phoneNumer,
            }
        })
    }


    async toggleManager(id: string) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        await this.prisma.user.update({
            where: { id },
            data: { status: existsUser.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })

        return { id, succes: true }
    }


    async createUser(payload: CreteUserDto, currentUser: JwtPayload) {
        const { firstName, lastName, password, phoneNumer, branchId, role, salary } = payload

        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } })
        if (!branch)
            throw new NotFoundException('Branch not found !')

        if (branch.companyId !== currentUser.companyId)
            throw new ForbiddenException('Access dined !')

        const existsUser = await this.prisma.user.findUnique({ where: { phoneNumer } })
        if (existsUser)
            throw new ConflictException('Phone alredy exists !')

        return await this.prisma.user.create({
            data: { firstName, lastName, phoneNumer, branchId, role, salary, password: await hashPassword(password) }
        })
    }


    async updateUser(id: string, payload: UpdateUserDto, currentUser: JwtPayload) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })

        if (!existsUser) throw new NotFoundException('User not found !')
        await this.checkBranch(existsUser.branchId!, currentUser)

        if (payload.phoneNumer && existsUser.phoneNumer !== payload.phoneNumer) {
            const existsPhone = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
            if (!existsPhone)
                throw new ConflictException('Phone alredy exists !')
        }

        return await this.prisma.user.update({
            where: { id },
            data: {
                firstName: payload.firstName ?? existsUser.firstName,
                lastName: payload.lastName ?? existsUser.lastName,
                phoneNumer: payload.phoneNumer ?? existsUser.phoneNumer,
                salary: payload.salary ?? existsUser.salary,
                password: payload.password ? await hashPassword(payload.password) : existsUser.phoneNumer
            },
        })
    }


    async toggleUser(id: string, currentUser: JwtPayload) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        await this.checkBranch(existsUser.branchId!, currentUser)
        await this.prisma.user.update({
            where: { id },
            data: { status: existsUser.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })

        return { id, succes: true }
    }
}
