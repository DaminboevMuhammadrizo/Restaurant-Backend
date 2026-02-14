import { ApiProperty } from "@nestjs/swagger"
import { IsMobilePhone, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator"

export class CreteManagerDto {

    @ApiProperty()
    @IsString()
    @MaxLength(24)
    firstName: string

    @ApiProperty()
    @IsString()
    @MaxLength(24)
    lastName: string

    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phoneNumer: string

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    companyId?: string
}
