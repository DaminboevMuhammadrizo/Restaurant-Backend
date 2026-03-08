import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIP, IsOptional, IsString } from "class-validator";

export class UpdateKitchenDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsIP()
    @IsString()
    posIp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    posPort?: string;
}
