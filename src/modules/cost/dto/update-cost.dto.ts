import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsUUID, IsNumberString } from 'class-validator';

export class UpdateCostDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    desc?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number;

    @ApiPropertyOptional({ description: 'Decimal string (12,2)' })
    @IsOptional()
    @IsNumberString()
    costAmount?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    costsCategoryId?: string;
}
