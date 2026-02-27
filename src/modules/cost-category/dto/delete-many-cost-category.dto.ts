import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class DeleteManyCostCategoryDto {

    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('4', { each: true })
    ids: string[];
}
