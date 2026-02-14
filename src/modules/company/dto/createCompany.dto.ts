import { ApiProperty } from "@nestjs/swagger"
import { IsMobilePhone, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateCompanyDto {

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(24)
    name: string

    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(24)
    founderName: string

    @ApiProperty()
    @IsString()
    @MaxLength(120)
    @IsOptional()
    bio?: string
}
