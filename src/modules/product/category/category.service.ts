import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { PrismaService } from 'src/common/Database/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }


    async getAll(currnetUser: JwtPayload) {
        if (currnetUser.role === UserRole.MANAGER || currnetUser.role === UserRole.SUPERADMIN) {

        }else {
            // const
        }
    }


    async create(payload: any, currnetUser: JwtPayload) { }


    async update(id: string, payload: any, currnetUser: JwtPayload) { }


    async updateStatus(id: string, currnetUser: JwtPayload) { }


    async delete(id: string, currnetUser: JwtPayload) { }
}
