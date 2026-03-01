import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsMobilePhone, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"

export class UpdateUserDto {

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
    password?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsOptional()
    salary?: number;
}
