import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateKitchenDto {

    @ApiProperty()
    @IsString()
    name: string
}
