import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/Database/prisma.service';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { GetAllComapnyQuery } from './dto/getAllCompanyQuery.dto';
import { UpdateCompanyDto } from './dto/update';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) { }


    async getAll(query: GetAllComapnyQuery, currentUser: JwtPayload) {
        const { search, offcet = 0, limit = 10 } = query;

        const where: any = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { founderName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                ],
            } : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                where,
                skip: offcet,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.company.count({ where }),
        ]);

        return {
            total,
            offcet,
            limit,
            data,
        };
    }


    async getMy(currentUser: JwtPayload) {
        const company = await this.prisma.company.findUnique({ where: { id: currentUser.companyId! } });
        if (!company) throw new NotFoundException('Company not found');
        return company;
    }


    async getOne(id: string, currentUser: JwtPayload) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        return company;
    }


    async create(payload: CreateCompanyDto, file: any | null, currentUser: JwtPayload) {
        const existing = await this.prisma.company.findUnique({ where: { phone: payload.phone } });
        if (existing) throw new BadRequestException('Company phone already exists');
        return this.prisma.company.create({ data: payload });
    }



    async update(id: string, payload: UpdateCompanyDto, file: any | null, currentUser: JwtPayload) {
        const company = await this.getOne(id, currentUser);

        if (payload.phone && payload.phone !== company.phone) {
            const existing = await this.prisma.company.findUnique({ where: { phone: payload.phone } });
            if (existing) throw new BadRequestException('Company phone already exists');
        }
        return this.prisma.company.update({ where: { id }, data: payload });
    }


    async delete(id: string, currentUser: JwtPayload) {
        await this.getOne(id, currentUser);
        return this.prisma.company.delete({ where: { id }, select: { id: true } });
    }
}
