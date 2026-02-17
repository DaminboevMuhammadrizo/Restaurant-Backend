import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator"

export class UpdateBranchDto {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    addres?: string


    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    companyId?: string

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    kpi?: number
}
