import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { UserRoleFilter } from "src/common/types/filter.user.role"

export class getUsersMeQuery {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search?: string

    @ApiPropertyOptional({ required: false, enum: UserRoleFilter })
    @IsEnum(UserRoleFilter)
    @IsOptional()
    role?: UserRoleFilter

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    offcet?: number

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    limit?: number
}
