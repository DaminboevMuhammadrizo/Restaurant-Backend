import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status } from '@prisma/client';
import { CreateKitchenDto } from './dto/crate.dto';
import { UpdateKitchenDto } from './dto/update.dto';

@Injectable()
export class KitchenService {
    constructor(private readonly prisma: PrismaService) { }


    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException('Branch not found!');
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException('Access Denied!');
    }


    private async getKitchen(id: string, currentUser: JwtPayload) {
        const kitchen = await this.prisma.kitchen.findUnique({ where: { id } });
        if (!kitchen) throw new NotFoundException('Kitchen not found!');
        await this.checkBranch(kitchen.branchId, currentUser);
        return kitchen;
    }


    async getAllForManager(branchId: string, currentUser: JwtPayload) {
        await this.checkBranch(branchId, currentUser);
        return await this.prisma.kitchen.findMany({ where: { branchId } });
    }


    async getAll(currentUser: JwtPayload) {
        return await this.prisma.kitchen.findMany({ where: { branchId: currentUser.branchId!, status: Status.ACTIVE } });
    }


    async create(payload: CreateKitchenDto, currentUser: JwtPayload) {
        await this.checkBranch(payload.branchId, currentUser);
        return await this.prisma.kitchen.create({ data: payload });
    }


    async update(id: string, payload: UpdateKitchenDto, currentUser: JwtPayload) {
        await this.getKitchen(id, currentUser);
        return await this.prisma.kitchen.update({ where: { id }, data: payload });
    }


    async updateStatus(id: string, currentUser: JwtPayload) {
        const kitchen = await this.getKitchen(id, currentUser);
        return await this.prisma.kitchen.update({
            where: { id },
            data: { status: kitchen.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        });
    }


    async delete(id: string, currentUser: JwtPayload) {
        await this.getKitchen(id, currentUser);
        return await this.prisma.kitchen.delete({ where: { id } });
    }
}
