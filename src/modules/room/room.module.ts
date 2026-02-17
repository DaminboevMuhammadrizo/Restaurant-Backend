import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomCategoryController } from './room-category/room-category.controller';
import { RoomCategoryService } from './room-category/room-category.service';

@Module({
    controllers: [RoomController, RoomCategoryController],
    providers: [RoomService, RoomCategoryService]
})
export class RoomModule { }
