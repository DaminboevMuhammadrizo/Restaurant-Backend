import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsArray } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty({ example: 'abc123', description: 'Mahsulot IDsi' })
    @IsString()
    productId: string;

    @ApiProperty({ example: 2, description: 'Miqdori' })
    @IsNumber()
    count: number;
}

export class CreatePrintOrderDto {
    @ApiProperty({ example: '101A' })
    @IsString()
    room: string;

    @ApiProperty({ example: 'Ali' })
    @IsString()
    waiter: string;

    @ApiProperty({ type: [CreateOrderItemDto] })
    @IsArray()
    items: CreateOrderItemDto[];

    @ApiProperty({ example: 30000 })
    @IsNumber()
    total: number;
}
