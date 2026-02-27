import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum DateFilter {
    yesterday = 'yesterday',
    today = 'today',
    last7 = 'last7',
    last30 = 'last30',
    custom = 'custom'
}

export class AnalyticsQueryDto {

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
}
