import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";
import { CreateRoomDto } from "./create.dto";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {

    @ApiPropertyOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsNumber()
    price?: number;
}
