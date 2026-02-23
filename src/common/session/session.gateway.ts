import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private activeUsers = new Map<string, string>();

    handleConnection(client: Socket) {
        console.log(`🔌 Client ulandi: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`❌ Client uzildi: ${client.id}`);
        for (const [userId, socketId] of this.activeUsers.entries()) {
            if (socketId === client.id) {
                this.activeUsers.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(
        @MessageBody() data: { userId: string; branchId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (!data.userId || !data.branchId) return;
        this.activeUsers.set(data.userId, client.id);
        client.join(data.branchId);
        console.log(`✅ User ${data.userId} filial xonasiga qo'shildi: ${data.branchId}`);
    }

    emitToBranch(branchId: string, event: string, payload: any) {
        this.server.to(branchId).emit(event, payload);
    }

    emitToUser(userId: string, event: string, payload: any) {
        const socketId = this.activeUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, payload);
        }
    }
}
