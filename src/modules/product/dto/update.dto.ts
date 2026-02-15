import { ApiPropertyOptional } from "@nestjs/swagger"
import { UnitType } from "@prisma/client"
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
    price?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
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
