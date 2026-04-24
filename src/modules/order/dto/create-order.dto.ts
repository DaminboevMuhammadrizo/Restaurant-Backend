import { IsUUID, IsArray, ValidateNested, ArrayMinSize, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
    @ApiProperty()
    @IsUUID()
    productId: string;

    @ApiProperty()
    @IsNumber()
    count: number;

    @ApiPropertyOptional({ type: [String], example: ["tuzi koproq", "yogsiz bolsin"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    additionalInfo?: string[];
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
