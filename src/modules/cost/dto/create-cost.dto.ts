import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsInt, Min, IsNumberString } from 'class-validator';

export class CreateCostDto {

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    desc?: string;

    @ApiProperty()
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: 'Decimal string (12,2)' })
    @IsNumberString()
    costAmount: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;

    @ApiProperty()
    @IsUUID()
    costsCategoryId: string;
}
