import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Status } from "@prisma/client"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"

export class getAllusersQuery {

    @ApiProperty({ enum: Object.values(Status) })
    @IsEnum(Status)
    status: Status

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
