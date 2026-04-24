import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { UnitType } from "@prisma/client"
import { Transform, Type } from "class-transformer"
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"

const parseAdditionalInfo = ({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return [value];
        }
    }

    return value;
}

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

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    kitchenId?: string

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @Transform(parseAdditionalInfo)
    @IsArray()
    @IsString({ each: true })
    additionalInfo?: string[]
}
