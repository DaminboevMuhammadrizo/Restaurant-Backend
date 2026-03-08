import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { CreatePosDto } from './dto/create.dto';
import { UpdatePosDto } from './dto/update.dto';
import { Status } from '@prisma/client';

@Injectable()
export class PosService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranchAccess(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException('Filial topilmadi');
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException('Access denied');
        return branch;
    }


    async findAll(currentUser: JwtPayload) {
        return await this.prisma.posTerminal.findMany({
            where: { branch: { companyId: currentUser.companyId! } },
            include: { branch: true }
        });
    }


    async findOne(id: string, currentUser: JwtPayload) {
        const pos = await this.prisma.posTerminal.findUnique({ where: { id }, include: { branch: true } });
        if (!pos) throw new NotFoundException('Terminal topilmadi');
        if (pos.branch.companyId !== currentUser.companyId) throw new ForbiddenException('Access denied');
        return pos;
    }


    async findMyBranchPos(currentUser: JwtPayload) {
        if (!currentUser.branchId) throw new BadRequestException('Foydalanuvchi biror filialga biriktirilmagan!');
        const pos = await this.prisma.posTerminal.findUnique({ where: { branchId: currentUser.branchId } });
        if (!pos) throw new NotFoundException('Ushbu filial uchun kassa terminali sozlanmagan');
        return pos;
    }


    async create(payload: CreatePosDto, currentUser: JwtPayload) {
        await this.checkBranchAccess(payload.branchId, currentUser);
        const existingPos = await this.prisma.posTerminal.findUnique({ where: { branchId: payload.branchId } });
        if (existingPos) throw new BadRequestException('Ushbu filialda kassa terminali allaqachon mavjud');
        return await this.prisma.posTerminal.create({ data: payload });
    }


    async update(id: string, payload: UpdatePosDto, currentUser: JwtPayload) {
        await this.findOne(id, currentUser);
        return await this.prisma.posTerminal.update({ where: { id }, data: payload });
    }


    async toggleStatus(id: string, currentUser: JwtPayload) {
        const pos = await this.findOne(id, currentUser);
        return await this.prisma.posTerminal.update({
            where: { id },
            data: { status: pos.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        });
    }


    async remove(id: string, currentUser: JwtPayload) {
        await this.findOne(id, currentUser);
        return await this.prisma.posTerminal.delete({ where: { id } });
    }
}
