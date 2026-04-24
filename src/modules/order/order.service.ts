import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma, Status } from '@prisma/client';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { GetOrdersDto } from './dto/get.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SocketService } from 'src/common/session/session.service';
import { SyncOrderDto } from './dto/update-order-items.dto';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService, private socketService: SocketService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllForManager(currentUser: JwtPayload, query: GetOrdersDto, branchId: string) {
        await this.checkBranch(branchId, currentUser);

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
                select: {
                    id: true,
                    status: true,
                    type: true,
                    endAt: true,
                    createdAt: true,
                    room: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumer: true,
                            role: true
                        }
                    },
                    orderItem: {
                        select: {
                            id: true,
                            count: true,
                            status: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    unit: true
                                }
                            }
                        }
                    }
                },
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
                select: {
                    id: true,
                    status: true,
                    type: true,
                    endAt: true,
                    createdAt: true,
                    room: {
                        select: {
                            id: true,
                            name: true,
                            roomCategory: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumer: true,
                            role: true
                        }
                    },
                    orderItem: {
                        select: {
                            id: true,
                            count: true,
                            status: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    amount: true,
                                    photo: true,
                                    status: true,
                                    unit: true
                                }
                            }
                        }
                    }
                },
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
                    where: { status: { not: "CANCELED" } },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, unit: true, photo: true },
                        }
                    }
                }
            }
        });

        if (!order) throw new NotFoundException('Order not found');

        const totalPriceDecimal = order.orderItem.reduce((sum, item) => {
            const price = item.product?.price ?? new Prisma.Decimal(0);
            return sum.plus(item.count.mul(price));
        }, new Prisma.Decimal(0));

        const totalPrice = totalPriceDecimal.toNumber();

        return {
            id: order.id,
            status: order.status,
            endAt: order.endAt,
            createdAt: order.createdAt,
            user: order.user,
            room: order.room,
            totalPrice,
            orderItorderItems: order.orderItem.map(item => ({
                productId: item.productId,
                count: item.count.toNumber(),
                status: item.status,
                product: item.product ? {
                    ...item.product,
                    price: item.product.price?.toNumber() ?? 0
                } : null
            }))
        };
    }


    async create(payload: CreateOrderDto, currentUser: JwtPayload) {
        const { roomId, orderItems } = payload;

        const room = await this.prisma.room.findUnique({ where: { id: roomId } });

        if (!room) throw new NotFoundException('Room not found');
        if (room.status !== Status.ACTIVE) throw new ForbiddenException('Room inactive');
        if (room.branchId !== currentUser.branchId) throw new ForbiddenException('Access Denied!');

        const activeOrder = await this.prisma.order.findFirst({
            where: {
                roomId,
                status: { in: [OrderStatus.PENDING, OrderStatus.READY] }
            }
        });

        if (activeOrder) throw new ForbiddenException('Bu honada odam bor yoki xona band');

        const branchId = room.branchId;
        const productIds = orderItems.map(i => i.productId);

        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, branchId, status: Status.ACTIVE }
        });

        if (products.length !== orderItems.length)
            throw new NotFoundException('Bazi productlar mavjud emas yoki inactive');

        const data = await this.prisma.$transaction(async (tx) => {
            return tx.order.create({
                data: {
                    userId: payload.waiterId,
                    roomId,
                    branchId,
                    status: OrderStatus.PENDING,
                    orderItem: {
                        create: orderItems.map(i => {
                            const countDecimal = new Prisma.Decimal(i.count);
                            const product = products.find(p => p.id === i.productId);
                            const priceDecimal = product?.price ?? new Prisma.Decimal(0);

                            return {
                                productId: i.productId,
                                branchId,
                                count: countDecimal,
                                total: countDecimal.mul(priceDecimal),
                                additionalInfo: i.additionalInfo || []
                            };
                        })
                    }
                },
                include: { orderItem: true }
            });
        });

        this.socketService.notifyOrderChange(data.branchId, data);

        return data;
    }


    async syncOrderItems(orderId: string, payload: SyncOrderDto, currentUser: JwtPayload) {

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItem: { where: { status: { not: OrderStatus.CANCELED } } } }
        });

        if (!order) throw new NotFoundException('Order topilmadi');
        if (order.branchId !== currentUser.branchId) throw new ForbiddenException('Access Denied');

        const incomingItems = payload.items;
        const existingItems = order.orderItem;

        return await this.prisma.$transaction(async (tx) => {
            for (const incoming of incomingItems) {
                const existing = existingItems.find(ei => ei.productId === incoming.productId);

                const incomingCountDecimal = new Prisma.Decimal(incoming.count);

                if (existing) {
                    if (!existing.count.equals(incomingCountDecimal)) {
                        await tx.orderItem.update({
                            where: { id: existing.id },
                            data: { count: incomingCountDecimal }
                        });
                    }
                } else {
                    const product = await tx.product.findUnique({
                        where: { id: incoming.productId, branchId: order.branchId, status: Status.ACTIVE }
                    });
                    if (!product) throw new NotFoundException(`Mahsulot topilmadi yoki nofaol: ${incoming.productId}`);

                    await tx.orderItem.create({
                        data: {
                            orderId,
                            productId: incoming.productId,
                            count: incomingCountDecimal,
                            branchId: order.branchId,
                            status: OrderStatus.PENDING
                        }
                    });
                }
            }

            const itemsToCancel = existingItems.filter(ei => !incomingItems.some(incoming => incoming.productId === ei.productId));

            if (itemsToCancel.length > 0) {
                await tx.orderItem.updateMany({
                    where: { id: { in: itemsToCancel.map(i => i.id) } },
                    data: { status: OrderStatus.CANCELED }
                });
            }

            const updatedOrder = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItem: {
                        where: { status: { not: OrderStatus.CANCELED } },
                        include: { product: true }
                    },
                    room: true,
                    user: true
                }
            });

            this.socketService.notifyOrderChange(order.branchId, updatedOrder);
            return updatedOrder;
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

        const data = await this.prisma.$transaction(async (tx) => {
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
        if (data)
            this.socketService.notifyOrderChange(data.branchId, data);
        return data;
    }


    async changeStatus(orderId: string, status: OrderStatus, currentUser: JwtPayload) {

        const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { orderItem: true } });
        if (!order) throw new NotFoundException('Order not found');

        if (order.branchId !== currentUser.branchId)
            throw new ForbiddenException('Access Denied!');

        const data = await this.prisma.$transaction(async (tx) => {
            if (status === OrderStatus.SUCCESS) {
                await tx.orderItem.updateMany({
                    where: { orderId, status: OrderStatus.PENDING },
                    data: { status: OrderStatus.SUCCESS }
                });
            }

            if (status === OrderStatus.READY || status === OrderStatus.CANCELED)
                await tx.orderItem.updateMany({ where: { orderId, status: OrderStatus.PENDING }, data: { status } });

            return await tx.order.update({
                where: { id: orderId },
                data: {
                    status,
                    endAt: status === OrderStatus.SUCCESS || status === OrderStatus.CANCELED ? new Date() : null
                }
            });
        });
        this.socketService.notifyOrderChange(data.branchId, data);
        return data;
    }


    async updateOrderItemToCanceled(itemId: string, amount: number, currentUser: JwtPayload) {

        const item = await this.prisma.orderItem.findFirst({
            where: { id: itemId, status: OrderStatus.PENDING },
            include: { order: true }
        });
        if (!item) throw new NotFoundException('OrderItem not found');

        if (item.branchId !== currentUser.branchId)
            throw new ForbiddenException('Access denied');

        if (item.status === OrderStatus.CANCELED)
            throw new BadRequestException('OrderItem already canceled');

        const amountDecimal = new Prisma.Decimal(amount);

        if (amountDecimal.lte(0) || amountDecimal.gt(item.count))
            throw new BadRequestException('Notogri amount');

        const data = await this.prisma.$transaction(async (tx) => {

            if (amountDecimal.equals(item.count)) {
                return await tx.orderItem.update({
                    where: { id: itemId },
                    data: { status: OrderStatus.CANCELED }
                });
            }

            await tx.orderItem.update({
                where: { id: itemId },
                data: { count: item.count.minus(amountDecimal) }
            });

            return await tx.orderItem.create({
                data: {
                    orderId: item.orderId,
                    productId: item.productId,
                    branchId: item.branchId,
                    count: amountDecimal,
                    status: OrderStatus.CANCELED
                }
            });
        });

        this.socketService.notifyOrderChange(data.branchId, data);
        return data;
    }
}
