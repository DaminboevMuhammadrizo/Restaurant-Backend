import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateRoomCategoryDto } from "./carete.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateRoomcategoryDto extends PartialType(CreateRoomCategoryDto) {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string | undefined;
}
