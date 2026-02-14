import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsMobilePhone, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateCompanyDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(24)
    name?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsMobilePhone("uz-UZ")
    phone?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(24)
    founderName?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(120)
    bio?: string
}
