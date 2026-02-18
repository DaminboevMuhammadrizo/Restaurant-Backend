import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreatePopularProductDto {

    @ApiProperty()
    @IsUUID()
    productId: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;
}
