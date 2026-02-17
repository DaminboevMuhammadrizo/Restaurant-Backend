import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsNumber } from "class-validator";

export class CreateRoomDto {

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsUUID()
    branchId: string;

    @ApiProperty()
    @IsUUID()
    roomCategoryId: string;
}
