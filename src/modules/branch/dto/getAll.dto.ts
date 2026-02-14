import { ApiProperty } from "@nestjs/swagger"
import { Status } from "@prisma/client"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"

export class getAllBranchDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    companyId: string

    @ApiProperty({ enum: Object.values(Status) })
    @IsEnum(Status)
    status: Status

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
