import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, IsUUID } from "class-validator"

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
}
