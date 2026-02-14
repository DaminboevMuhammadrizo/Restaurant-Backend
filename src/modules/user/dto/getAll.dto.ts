import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsInt, IsOptional, IsString } from "class-validator"

export class getAllusersQuery {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search?: string

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    offcet?: number

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    limit?: number
}
