import { Module } from '@nestjs/common';
import { CostCategoryController } from './cost-category.controller';
import { CostCategoryService } from './cost-category.service';

@Module({
  controllers: [CostCategoryController],
  providers: [CostCategoryService]
})
export class CostCategoryModule {}
