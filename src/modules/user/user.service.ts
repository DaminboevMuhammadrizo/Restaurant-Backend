import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { getAllusersQuery } from './dto/getAll.dto';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status, UserRole } from '@prisma/client';
import { getUsersMeQuery } from './dto/get-me-users.dto';
import { CreteManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllManagers(query: getAllusersQuery) {
        const { search, offcet = 0, limit = 10 } = query;

        const where: any = { role: 'MANAGER' };
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


    async createManager(payload: CreteManagerDto) { }


    async updateManager(id: string, payload: UpdateManagerDto) { }


    async deleteManager(id: string) { }
}
