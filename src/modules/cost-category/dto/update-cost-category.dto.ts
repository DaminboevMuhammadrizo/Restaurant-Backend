import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCostCategoryDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;
}
