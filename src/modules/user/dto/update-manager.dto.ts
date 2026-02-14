import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsMobilePhone, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateManagerDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(24)
    firstName?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(24)
    lastName?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsMobilePhone("uz-UZ")
    phoneNumer?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string
}
