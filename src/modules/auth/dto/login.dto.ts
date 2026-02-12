import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class LoginDto {

    @ApiProperty({example: '+998335242981'})
    @IsString()
    identifier: string

    @ApiProperty({example: 'password'})
    @IsString()
    @MinLength(6)
    password: string
}
