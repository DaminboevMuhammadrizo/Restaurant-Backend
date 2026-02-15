import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength } from "class-validator";

export class CreateCategoryDto {

    @ApiProperty()
    @IsUUID()
    branchId: string

    @ApiProperty()
    @IsString()
    @MaxLength(32)
    name: string
}
