import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateCategoryDto {

    @ApiPropertyOptional()
    @IsString()
    @MaxLength(32)
    name?: string
}
