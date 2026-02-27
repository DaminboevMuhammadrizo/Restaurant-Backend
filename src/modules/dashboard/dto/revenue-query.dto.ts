import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RevenueFilter {
    yesterday = 'yesterday',
    today = 'today',
    last7 = 'last7',
    last30 = 'last30',
    custom = 'custom'
}

export class RevenueQueryDto {

    @ApiPropertyOptional({ enum: RevenueFilter })
    @IsOptional()
    @IsEnum(RevenueFilter)
    filter?: RevenueFilter;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    to?: string;
}
