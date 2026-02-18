import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { getAllusersQuery } from './dto/getAll.dto';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { Status, UserRole } from '@prisma/client';
import { getUsersMeQuery } from './dto/get-me-users.dto';
import { CreteManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { hashPassword } from 'src/common/config/bcrypt';
import { CreteUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto copy';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    private async checkBranch(branchId: string, currentUser: JwtPayload) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.status !== Status.ACTIVE) throw new NotFoundException("Branch not found!");
        if (branch.companyId !== currentUser.companyId) throw new ForbiddenException("Access Denied!");
    }


    async getAllManagers(query: getAllusersQuery) {
        const { status, search, offcet = 0, limit = 10 } = query;

        const where: any = { role: 'MANAGER', status };
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
        const where: any = { branchId, status: Status.ACTIVE };

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


    async getWaiters(currentUser: JwtPayload) {
        if (currentUser.role === UserRole.MANAGER) await this.checkBranch(currentUser.branchId!, currentUser);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where: { branchId: currentUser.branchId!, role: UserRole.AFITSANT, status: Status.ACTIVE },
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
            this.prisma.user.count({ where: { branchId: currentUser.branchId!, role: UserRole.AFITSANT } }),
        ]);

        return { total, data };
    }


    async createManager(payload: CreteManagerDto) {
        const company = await this.prisma.company.findUnique({ where: { id: payload.companyId } })
        if (!company)
            throw new NotFoundException('Company not found !')

        const existsUser = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
        if (existsUser)
            throw new ConflictException('Phone alredy exists !')

        return await this.prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                phoneNumer: payload.phoneNumer,
                password: await hashPassword(payload.password),
                role: UserRole.MANAGER,
                companyId: payload.companyId
            }
        })
    }


    async updateManager(id: string, payload: UpdateManagerDto) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        if (payload.phoneNumer && existsUser.phoneNumer !== payload.phoneNumer) {
            const existsPhone = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
            if (existsPhone)
                throw new ConflictException('Phone alredy exists !')
        }

        return await this.prisma.user.update({
            where: { id },
            data: {
                firstName: payload.firstName ?? existsUser.firstName,
                lastName: payload.lastName ?? existsUser.lastName,
                phoneNumer: payload.phoneNumer ?? existsUser.phoneNumer,
                password: payload.password ? await hashPassword(payload.password) : existsUser.phoneNumer,
            }
        })
    }


    async toggleManager(id: string) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        await this.prisma.user.update({
            where: { id },
            data: { status: existsUser.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })

        return { id, succes: true }
    }


    async createUser(payload: CreteUserDto, currentUser: JwtPayload) {
        const { firstName, lastName, password, phoneNumer, branchId, role } = payload

        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } })
        if (!branch)
            throw new NotFoundException('Branch not found !')

        if (branch.companyId !== currentUser.companyId)
            throw new ForbiddenException('Access dined !')

        const existsUser = await this.prisma.user.findUnique({ where: { phoneNumer } })
        if (existsUser)
            throw new ConflictException('Phone alredy exists !')

        return await this.prisma.user.create({
            data: { firstName, lastName, phoneNumer, branchId, role, password: await hashPassword(password) }
        })
    }


    async updateUser(id: string, payload: UpdateUserDto, currentUser: JwtPayload) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        await this.checkBranch(existsUser.branchId!, currentUser)

        if (payload.phoneNumer && existsUser.phoneNumer !== payload.phoneNumer) {
            const existsPhone = await this.prisma.user.findUnique({ where: { phoneNumer: payload.phoneNumer } })
            if (!existsPhone)
                throw new ConflictException('Phone alredy exists !')
        }

        return await this.prisma.user.update({
            where: { id },
            data: {
                firstName: payload.firstName ?? existsUser.firstName,
                lastName: payload.lastName ?? existsUser.lastName,
                phoneNumer: payload.phoneNumer ?? existsUser.phoneNumer,
                password: payload.password ? await hashPassword(payload.password) : existsUser.phoneNumer
            },
        })
    }


    async toggleUser(id: string, currentUser: JwtPayload) {
        const existsUser = await this.prisma.user.findUnique({ where: { id } })
        if (!existsUser)
            throw new NotFoundException('User not found !')

        await this.checkBranch(existsUser.branchId!, currentUser)
        await this.prisma.user.update({
            where: { id },
            data: { status: existsUser.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE }
        })

        return { id, succes: true }
    }
}
