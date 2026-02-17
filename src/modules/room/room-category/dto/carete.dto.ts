import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateRoomCategoryDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;
}
