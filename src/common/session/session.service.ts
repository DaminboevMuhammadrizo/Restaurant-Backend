import { Injectable } from '@nestjs/common';
import { SocketGateway } from './session.gateway';

@Injectable()
export class SocketService {
    constructor(private readonly gateway: SocketGateway) { }

    notifyOrderChange(branchId: string, orderData: any) {
        this.gateway.emitToBranch(branchId, 'order_updated', {
            message: 'Buyurtma yangilandi',
            data: orderData,
            timestamp: new Date(),
        });
    }

    notifyOrderItemChange(branchId: string, itemData: any) {
        this.gateway.emitToBranch(branchId, 'order_item_updated', {
            message: 'Buyurtma tarkibi ozgardi',
            data: itemData,
            timestamp: new Date(),
        });
    }
}
