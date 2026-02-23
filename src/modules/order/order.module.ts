import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SessionModule } from 'src/common/session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
