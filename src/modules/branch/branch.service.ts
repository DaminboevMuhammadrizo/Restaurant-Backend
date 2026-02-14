import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { getAllBranchDto } from './dto/getAll.dto';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { UpdateBranchDto } from './dto/update.dto';
import { CreateBranchDto } from './dto/create.dto';
import { Status, UserRole } from '@prisma/client';

@Injectable()
export class BranchService {
    constructor(private readonly prisma: PrismaService) { }

    async getAll(query: getAllBranchDto, currentUser: JwtPayload) {
        const { search, offcet = 0, limit = 10 } = query;

        let companyId: string = query.companyId;
        if (currentUser.role === UserRole.MANAGER) companyId = currentUser.companyId!;

        const where: any = { status: query.status };
        if (companyId) where.companyId = companyId;
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.branch.findMany({
                where,
                skip: offcet,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.branch.count({ where }),
        ]);

        return {
            total,
            offcet,
            limit,
            data,
        };
    }


    async getOne(id: string, currentUser: JwtPayload) {
        const where: any = { id };
        if (currentUser.role === UserRole.MANAGER) where.companyId = currentUser.companyId;
        const branch = await this.prisma.branch.findFirst({ where });
        if (!branch) throw new NotFoundException('Branch not found');

        return branch;
    }


    async getMy(currnetUser: JwtPayload) {
        return this.prisma.branch.findMany({
            where: { companyId: currnetUser.companyId! },
            orderBy: { createdAt: 'desc' }
        });
    }


    async create(payload: CreateBranchDto, currentUser: JwtPayload) {
        let companyId: string;

        if (currentUser.role === UserRole.MANAGER) {
            if (!currentUser.companyId) throw new ForbiddenException('Company not found');
            companyId = currentUser.companyId;
        } else {
            if (!payload.companyId) throw new BadRequestException('companyId is required');
            companyId = payload.companyId;
        }

        const existing = await this.prisma.branch.findUnique({ where: { name: payload.name } });
        if (existing) throw new BadRequestException('Branch name already exists');

        return this.prisma.branch.create({
            data: {
                name: payload.name,
                addres: payload.addres,
                companyId,
            },
        });
    }


    async update(id: string, payload: UpdateBranchDto, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });

        if (!branch) throw new NotFoundException('Branch not found');

        if (currentUser.role === UserRole.MANAGER && branch.companyId !== currentUser.companyId)
            throw new ForbiddenException('Access denied');

        let companyId = branch.companyId;
        if (currentUser.role === UserRole.SUPERADMIN && payload.companyId)
            companyId = payload.companyId;

        if (payload.name && payload.name !== branch.name) {
            const existing = await this.prisma.branch.findUnique({ where: { name: payload.name } });
            if (existing) throw new BadRequestException('Branch name already exists');
        }

        return this.prisma.branch.update({
            where: { id },
            data: {
                name: payload.name,
                addres: payload.addres,
                companyId,
            },
        });
    }


    async toggleStatus(id: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch) throw new NotFoundException('Branch not found');

        if (currentUser.role === UserRole.MANAGER && branch.companyId !== currentUser.companyId)
            throw new ForbiddenException('Access denied');

        return this.prisma.branch.update({
            where: { id },
            data: { status: branch.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE },
        });
    }


    async delete(id: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch) throw new NotFoundException('Branch not found');

        if (currentUser.role === UserRole.MANAGER && branch.companyId !== currentUser.companyId)
            throw new ForbiddenException('Access denied');

        return this.prisma.branch.delete({ where: { id } });
    }
}
