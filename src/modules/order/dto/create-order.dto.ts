import { IsUUID, IsArray, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
    @ApiProperty()
    @IsUUID()
    productId: string;

    @ApiProperty()
    @IsNumber()
    count: number;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsUUID()
    roomId: string;

    @ApiProperty()
    @IsUUID()
    waiterId: string;

    @ApiProperty({ type: () => [OrderItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    orderItems: OrderItemDto[];
}
