import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../Database/prisma.service";
import { hashPassword } from "../config/bcrypt";
import { UserRole, Status } from "@prisma/client";

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        try {
            let company = await this.prisma.company.findUnique({
                where: { phone: "+998335242981" },
            });

            if (!company) {
                company = await this.prisma.company.create({
                    data: {
                        name: "D.M",
                        phone: "+998335242981",
                        founderName: "Muhammadrioz Daminboev",
                    },
                });
                console.log("\x1b[32m%s\x1b[0m", "[Seeder]: Company yaratildi ✅");
            } else {
                console.log("\x1b[36m%s\x1b[0m", "[Seeder]: Company allaqachon mavjud");
            }

            const superAdmin = await this.prisma.user.findFirst({
                where: { role: UserRole.SUPERADMIN, companyId: company.id },
            });

            if (!superAdmin) {
                const hashedPassword = await hashPassword("password");
                await this.prisma.user.create({
                    data: {
                        firstName: "Muhammadrioz",
                        lastName: "Daminboev",
                        phoneNumer: "+998335242981",
                        password: hashedPassword,
                        role: UserRole.SUPERADMIN,
                        companyId: company.id,
                        branchId: null,
                    },
                });
                console.log("\x1b[32m%s\x1b[0m", "[Seeder]: SuperAdmin yaratildi ✅");
            } else {
                console.log("\x1b[36m%s\x1b[0m", "[Seeder]: SuperAdmin allaqachon mavjud");
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", "[Seeder Error]:", error.message);
        }
    }
}
