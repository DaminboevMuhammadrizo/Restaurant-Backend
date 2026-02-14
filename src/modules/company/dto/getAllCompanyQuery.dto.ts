import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsOptional, IsString } from "class-validator"

export class GetAllComapnyQuery {

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    search: string

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    offcet?: number

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    limit?: number
}
