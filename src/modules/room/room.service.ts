import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status } from '@prisma/client';
import { CreateRoomDto } from './dto/create.dto';
import { UpdateRoomDto } from './dto/update.dto';

@Injectable()
export class RoomService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException('Branch not found!');
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException('Access Denied!');
    }


    private async checkCategory(roomCategoryId: string, branchId: string) {
        const category = await this.prisma.roomCategory.findFirst({
            where: { id: roomCategoryId, branchId }
        });

        if (!category || category.status !== Status.ACTIVE)
            throw new BadRequestException('Room Category not found or inactive!');
    }


    async getAllFormanager(branchId: string, currentUser: JwtPayload, roomCategoryId?: string, search?: string) {
        await this.checkBranch(branchId, currentUser);

        return await this.prisma.room.findMany({
            where: {
                branchId,
                ...(roomCategoryId && { roomCategoryId }),
                ...(search && { name: { contains: search, mode: 'insensitive' } })
            },
            include: { roomCategory: true }
        });
    }


    async getAll(currentUser: JwtPayload, roomCategoryId?: string, search?: string) {
        await this.checkBranch(currentUser.branchId!, currentUser);

        return await this.prisma.room.findMany({
            where: {
                branchId: currentUser.branchId!,
                ...(roomCategoryId && { roomCategoryId }),
                ...(search && { name: { contains: search, mode: 'insensitive' } }),
                status: Status.ACTIVE
            },
            include: { roomCategory: true }
        });
    }


    async create(payload: CreateRoomDto, currentUser: JwtPayload) {
        await this.checkBranch(payload.branchId, currentUser);
        await this.checkCategory(payload.roomCategoryId, payload.branchId);
        return await this.prisma.room.create({ data: payload });
    }


    async update(id: string, payload: UpdateRoomDto, currentUser: JwtPayload) {
        const room = await this.prisma.room.findUnique({ where: { id } });

        if (!room)
            throw new NotFoundException('Room not found!');

        await this.checkBranch(room.branchId, currentUser);

        if (room.status === Status.INACTIVE)
            throw new BadRequestException('Room INACTIVED');

        if (payload.roomCategoryId)
            await this.checkCategory(payload.roomCategoryId, room.branchId);

        return await this.prisma.room.update({ where: { id }, data: payload });
    }


    async updateStatus(id: string, currentUser: JwtPayload) {
        const room = await this.prisma.room.findUnique({ where: { id } });

        if (!room)
            throw new NotFoundException('Room not found!');

        await this.checkBranch(room.branchId, currentUser);

        return await this.prisma.room.update({
            where: { id },
            data: { status: room.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        });
    }
}
