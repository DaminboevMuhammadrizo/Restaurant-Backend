import { DateFilter } from '../../cost-category/dto/query.dto';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class CostQueryDto {

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    costsCategoryId?: string;
}
