import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsUUID } from "class-validator";

export class UpdateRoomDto {

    @ApiPropertyOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsNumber()
    price?: number;

    @ApiProperty()
    @IsUUID()
    roomCategoryId: string;
}
