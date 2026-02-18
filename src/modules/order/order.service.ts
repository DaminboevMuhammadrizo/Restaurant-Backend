import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { PrismaService } from 'src/common/Database/prisma.service';
import { OrderStatus, Status } from '@prisma/client';

@Injectable()
export class OrderService {

    constructor(private prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }

    async create(createOrderDto: CreateOrderDto, currentUser: JwtPayload) {
        const { roomId, orderItems } = createOrderDto;

        const room = await this.prisma.room.findUnique({ where: { id: roomId }, include: { branch: true }, });

        if (!room) throw new NotFoundException('Room topilmadi');
        if (room.status !== Status.ACTIVE) throw new BadRequestException('Room inactive');

        const branchId = room.branchId;
        await this.checkBranch(branchId, currentUser)

        const productIds = orderItems.map(i => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, branchId, status: Status.ACTIVE }
        });

        if (products.length !== orderItems.length)
            throw new BadRequestException('Bazi productlar mavjud emas yoki inactive');

        for (const item of orderItems) {
            const product: any = products.find(p => p.id === item.productId);
            if (item.count > product.amount)
                throw new BadRequestException(`Product ${product.name} soni yetarli emas`);
        }

        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: currentUser.id,
                    roomId,
                    branchId,
                    status: OrderStatus.PENDING,
                    orderItem: {
                        create: orderItems.map(i => ({ productId: i.productId, branchId, count: i.count }))
                    },
                },
                include: { orderItem: true },
            });

            for (const item of orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { amount: { decrement: item.count } },
                });
            }

            return newOrder;
        });

        return order;
    }
}
