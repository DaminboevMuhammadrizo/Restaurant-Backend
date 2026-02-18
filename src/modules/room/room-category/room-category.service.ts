import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status } from '@prisma/client';
import { CreateRoomCategoryDto } from './dto/carete.dto';
import { UpdateRoomcategoryDto } from './dto/update.dto';

@Injectable()
export class RoomCategoryService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllForManager(branchId: string, currentUser: JwtPayload) {
        await this.checkBranch(branchId, currentUser)
        return await this.prisma.roomCategory.findMany({ where: { branchId, status: Status.ACTIVE } })
    }


    async getAll(currentUser: JwtPayload) {
        await this.checkBranch(currentUser.branchId!, currentUser)
        return await this.prisma.roomCategory.findMany({ where: { branchId: currentUser.branchId!, status: Status.ACTIVE } })
    }


    async craete(payload: CreateRoomCategoryDto, currentUser: JwtPayload) {
        await this.checkBranch(payload.branchId, currentUser)
        return await this.prisma.roomCategory.create({ data: payload })
    }


    async update(id: string, payload: UpdateRoomcategoryDto, currentUser: JwtPayload) {
        const category = await this.prisma.roomCategory.findFirst({ where: { id } })
        if (!category)
            throw new NotFoundException('Category not found !')

        await this.checkBranch(category.branchId, currentUser)

        if (category.status === Status.INACTIVE)
            throw new BadRequestException('Category INACTIVED')

        return await this.prisma.roomCategory.update({ where: { id }, data: payload })
    }


    async updateStatus(id: string, currentUser: JwtPayload) {
        const category = await this.prisma.roomCategory.findFirst({ where: { id } })
        if (!category)
            throw new NotFoundException('Category not found !')

        await this.checkBranch(category.branchId, currentUser)
        return await this.prisma.roomCategory.update({
            where: { id },
            data: { status: category.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })

    }
}
