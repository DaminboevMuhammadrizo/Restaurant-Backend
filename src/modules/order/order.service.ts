import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Status, UserRole } from '@prisma/client';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { GetOrdersDto } from './dto/get.dto';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }

    async getAllForManager(currentUser: JwtPayload, query: GetOrdersDto, branchId: string) {
        await this.checkBranch(branchId, currentUser)

        const { search, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        if (!branchId) throw new ForbiddenException('branchId kerak');
        const where: any = { branchId };

        if (search) {
            where.OR = [
                { room: { name: { contains: search, mode: 'insensitive' } } },
                { orderItem: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
            ];
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { orderItem: { include: { product: true } }, room: true, user: true },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { data, total, page, limit };
    }


    async getAllForStaff(currentUser: JwtPayload, query: GetOrdersDto) {

        const { search, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        if (!currentUser.branchId) throw new ForbiddenException('BranchId kerak token orqali');
        const where: any = { branchId: currentUser.branchId };

        if (search) {
            where.OR = [
                { room: { name: { contains: search, mode: 'insensitive' } } },
                { orderItem: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
            ];
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { orderItem: { include: { product: true } }, room: true, user: true },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { data, total, page, limit };
    }


    async create(createOrderDto: CreateOrderDto, currentUser: JwtPayload) {
        const { roomId, orderItems } = createOrderDto;

        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { branch: true },
        });

        if (!room) throw new NotFoundException('Room not found');
        if (room.status !== Status.ACTIVE) throw new ForbiddenException('Room inactive');

        const branchId = room.branchId;
        await this.checkBranch(branchId, currentUser)
        const productIds = orderItems.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, branchId, status: Status.ACTIVE }
        });

        if (products.length !== orderItems.length)
            throw new NotFoundException('Bazi productlar mavjud emas yoki inactive');

        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: currentUser.id,
                    roomId,
                    branchId,
                    status: OrderStatus.PENDING,
                    orderItem: {
                        create: orderItems.map(i => ({
                            productId: i.productId,
                            branchId,
                            count: i.count,
                        })),
                    },
                },
                include: { orderItem: true },
            });

            return newOrder;
        });

        return order;
    }


    async changeStatus(orderId: string, status: OrderStatus, currentUser: JwtPayload) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');


        if ([UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA].includes(currentUser.role as any)) {
            await this.checkBranch(order.branchId, currentUser)
        } else {
            throw new ForbiddenException('Siz bu actionni bajara olmaysiz');
        }

        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    }
}
