import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCostCategoryDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsUUID()
    branchId: string;
}
