import { Module } from '@nestjs/common';
import { PopularProductsController } from './popular-products.controller';
import { PopularProductsService } from './popular-products.service';

@Module({
  controllers: [PopularProductsController],
  providers: [PopularProductsService]
})
export class PopularProductsModule {}
