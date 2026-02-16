import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { UnitType } from "@prisma/client"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"

export class CreateProductDto {

    @ApiProperty()
    @IsString()
    @MaxLength(32)
    name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(32)
    desc?: string

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    price: number

    @ApiProperty()
    @IsInt()
    @Type(() => Number)
    amount: number

    @ApiProperty({ enum: Object.values(UnitType) })
    @IsEnum(UnitType)
    unit: UnitType

    @ApiProperty()
    @IsUUID()
    branchId: string

    @ApiProperty()
    @IsUUID()
    productCategoryId: string
}
