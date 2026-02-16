import { ApiPropertyOptional } from "@nestjs/swagger"
import { UnitType } from "@prisma/client"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"

export class UpdateProductDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(32)
    name?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(32)
    desc?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    price?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    amount?: number

    @ApiPropertyOptional({ enum: Object.values(UnitType) })
    @IsOptional()
    @IsEnum(UnitType)
    unit?: UnitType

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    productCategoryId?: string
}
