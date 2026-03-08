import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIP, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateKitchenDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;

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
