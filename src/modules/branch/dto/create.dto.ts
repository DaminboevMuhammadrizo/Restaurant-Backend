import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator"

export class CreateBranchDto {

    @ApiProperty()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    addres?: string

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    companyId?: string

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    kpi?: number
}
