import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../Database/prisma.service";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../config/bcrypt";

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedSuperAdmin();
    }

    async seedSuperAdmin() {
        try {
            const superAdminData = {
                fullName: "Muhammadrizo",
                phone: "+998335242981",
                role: UserRole.SUPERADMIN,
                password: "password",
            };

            const hashedPassword = await hashPassword(superAdminData.password);

            const existingAdmin = await this.prisma.user.findFirst({
                where: {
                    phone: superAdminData.phone,
                    role: UserRole.SUPERADMIN,
                },
            });

            if (!existingAdmin) {
                const admin = await this.prisma.user.create({
                    data: {
                        fullName: superAdminData.fullName,
                        phone: superAdminData.phone,
                        role: superAdminData.role,
                        password: hashedPassword,
                    },
                });

                console.log("\x1b[32m%s\x1b[0m", "✅ [Seeder]: SuperAdmin yaratildi");

                console.table({
                    ID: admin.id,
                    Name: admin.fullName,
                    Phone: admin.phone,
                    Role: admin.role,
                });
            } else {
                console.log("\x1b[36m%s\x1b[0m", "ℹ️ [Seeder]: SuperAdmin allaqachon mavjud");
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", "❌ [Seeder Error]:", error);
        }
    }
}
