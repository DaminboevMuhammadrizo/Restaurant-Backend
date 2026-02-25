import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SyncOrderItemDto {
    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({})
    @IsInt()
    @Min(1)
    count: number;
}

export class SyncOrderDto {
    @ApiProperty({ type: [SyncOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncOrderItemDto)
    items: SyncOrderItemDto[];
}
