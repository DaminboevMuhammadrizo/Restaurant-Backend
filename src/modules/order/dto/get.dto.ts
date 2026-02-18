import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetOrdersDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;
}
