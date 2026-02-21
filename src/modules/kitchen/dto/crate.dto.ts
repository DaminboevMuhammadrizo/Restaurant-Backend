import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateKitchenDto {

    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsUUID()
    branchId: string
}
