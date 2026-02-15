import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetProductDto {
    @ApiPropertyOptional({})
    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    page?: number = 1;

    @ApiPropertyOptional({})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    limit?: number = 10;

    @ApiPropertyOptional({})
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({})
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}
