import { Module } from "@nestjs/common";
import { SeederService } from "./seader.service";
import { PrismaModule } from "../Database/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [SeederService],
    exports:[SeederService],
})
export class SeaderModule { }
