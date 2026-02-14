import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [JwtModule, JwtModule],
    controllers: [],
    providers: []
})
export class ConfgModule { }
