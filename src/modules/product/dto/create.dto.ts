import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { UnitType } from "@prisma/client"
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
    price: number

    @ApiProperty()
    @IsInt()
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
