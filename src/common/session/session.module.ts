import { Module } from '@nestjs/common';
import { SocketService } from './session.service';
import { SocketGateway } from './session.gateway';

@Module({
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService]
})
export class SessionModule {}
