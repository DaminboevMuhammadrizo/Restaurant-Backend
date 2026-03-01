import { ApiProperty } from "@nestjs/swagger"
import { UserRole } from "@prisma/client"
import { IsEnum, IsMobilePhone, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"

export class CreteUserDto {

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
    password: string

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    branchId?: string

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    salary?: number;
}
