import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Status, UserRole } from '@prisma/client';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { GetOrdersDto } from './dto/get.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

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


    async getOne(currentUser: JwtPayload, id: string) {

        const order = await this.prisma.order.findFirst({
            where: { id, branchId: currentUser.branchId! },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, phoneNumer: true },
                },
                room: {
                    select: { id: true, name: true, price: true },
                },
                orderItem: {
                    where: { status: { not: OrderStatus.CANCELED } },
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, unit: true, photo: true },
                        }
                    }
                }
            }
        });

        if (!order) throw new NotFoundException('Order not found');
        const totalPrice = order.orderItem.reduce((sum, item) => sum + item.count * item.product.price, 0);

        return {
            id: order.id,
            status: order.status,
            endAt: order.endAt,
            createdAt: order.createdAt,
            user: order.user,
            room: order.room,
            totalPrice,
            orderItems: order.orderItem.map(item => ({
                productId: item.productId,
                count: item.count,
                status: item.status,
                product: item.product,
            })),
        };
    }


    async create(payload: CreateOrderDto, currentUser: JwtPayload) {
        const { roomId, orderItems } = payload;

        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { branch: true },
        });

        if (!room) throw new NotFoundException('Room not found');
        if (room.status !== Status.ACTIVE) throw new ForbiddenException('Room inactive');

        const branchId = room.branchId;
        if (room.branchId !== currentUser.branchId)
            throw new ForbiddenException('Acsess Dined!')

        const productIds = orderItems.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, branchId, status: Status.ACTIVE }
        });

        if (products.length !== orderItems.length)
            throw new NotFoundException('Bazi productlar mavjud emas yoki inactive');

        return await this.prisma.$transaction(async (tx) => {
            return await tx.order.create({
                data: {
                    userId: payload.waiterId,
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
        });
    }


    async updateOrder(id: string, payload: UpdateOrderDto, currentUser: JwtPayload) {

        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Order not found !');

        if (order.branchId !== currentUser.branchId)
            throw new ForbiddenException('Acsess Dined!');

        if (order.status === OrderStatus.CANCELED || order.status === OrderStatus.SUCCESS)
            throw new NotFoundException('Zakaz tugagan yoki bekor bolgan !');

        const productIds = payload.orderItems.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
                branchId: order.branchId,
                status: Status.ACTIVE
            }
        });

        if (products.length !== payload.orderItems.length)
            throw new NotFoundException('Bazi productlar mavjud emas yoki inactive');

        return await this.prisma.$transaction(async (tx) => {
            await tx.orderItem.createMany({
                data: payload.orderItems.map(i => ({
                    productId: i.productId,
                    branchId: order.branchId,
                    orderId: id,
                    count: i.count,
                })),
            });
            return tx.order.findUnique({
                where: { id },
                include: {
                    orderItem: {
                        include: { product: true },
                    },
                },
            });

        });

    }


    async changeStatus(orderId: string, status: OrderStatus, currentUser: JwtPayload) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });

        if (!order) throw new NotFoundException('Order not found');

        if ([UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA].includes(currentUser.role as any))
            if (order.branchId !== currentUser.branchId) throw new ForbiddenException('Acsess Dined!');
            else
                throw new ForbiddenException('Siz bu actionni bajara olmaysiz');

        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                endAt: status === OrderStatus.SUCCESS || status === OrderStatus.CANCELED ? new Date() : null,
            },
        });
    }


    async updateOrderItemStatus(itemId: string, status: OrderStatus, currentUser: JwtPayload) {

        if (status !== OrderStatus.CANCELED)
            throw new BadRequestException('faqat "CANCELED" ga ozgartira olasiz !');

        const item = await this.prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });

        if (!item) throw new NotFoundException('OrderItem not found');
        if (item.branchId !== currentUser.branchId)
            throw new ForbiddenException('Access denied');

        if (item.status === OrderStatus.CANCELED)
            throw new BadRequestException('OrderItem already canceled');

        const data = { status: OrderStatus.CANCELED, updatedAt: new Date() };
        return this.prisma.orderItem.update({
            where: { id: itemId },
            data,
            include: {
                product: true,
                order: true,
            },
        });
    }

}
