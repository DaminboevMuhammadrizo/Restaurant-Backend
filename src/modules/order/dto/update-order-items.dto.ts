import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
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

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    additionalInfo?: string[];
}

export class SyncOrderDto {
    @ApiProperty({ type: [SyncOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncOrderItemDto)
    items: SyncOrderItemDto[];
}
