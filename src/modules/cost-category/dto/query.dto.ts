import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum DateFilter {
    yesterday = 'yesterday',
    today = 'today',
    last7 = 'last7',
    last30 = 'last30',
    custom = 'custom'
}

export class CostCategoryQueryDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: DateFilter })
    @IsOptional()
    @IsEnum(DateFilter)
    filter?: DateFilter;

    @ApiPropertyOptional()
    @IsOptional()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    to?: string;

    @ApiPropertyOptional()
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number = 10;
}
