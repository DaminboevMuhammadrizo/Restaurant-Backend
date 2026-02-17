import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateRoomcategoryDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;
}
