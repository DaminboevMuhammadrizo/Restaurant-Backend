import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsDateString, ValidateIf } from "class-validator";

export enum TimeFilter {
    TODAY = 'today',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CUSTOM = 'custom'
}

export class GetWaitersKpiDto {
    @ApiPropertyOptional({})
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ default: 0 })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    offset?: number = 0;

    @ApiPropertyOptional({ default: 10 })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiProperty({ enum: TimeFilter, default: TimeFilter.MONTHLY })
    @IsEnum(TimeFilter)
    @IsOptional()
    timeType?: TimeFilter = TimeFilter.MONTHLY;

    @ApiPropertyOptional({ example: '2024-01-01' })
    @ValidateIf(o => o.timeType === TimeFilter.CUSTOM)
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({ example: '2024-01-31' })
    @ValidateIf(o => o.timeType === TimeFilter.CUSTOM)
    @IsDateString()
    toDate?: string;
}
