import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIP, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePosDto {
    @ApiProperty({ example: 'Asosiy Kassa' })
    @IsString()
    name: string;

    @ApiProperty({ example: '192.168.1.100' })
    @IsIP()
    ipAddress: string;

    @ApiPropertyOptional({ example: '9100' })
    @IsOptional()
    @IsString()
    port?: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;
}
