import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString } from "class-validator"

export class GetWaitersKpiDto {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search?: string

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    offcet?: number

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    limit?: number
}
