import { Injectable } from '@nestjs/common';
import * as net from 'net';

export interface OrderItemDto {
    name: string;
    count: number;
    price: number;
    status: string;
}

export interface PrintOrderDto {
    room: string;
    waiter: string;
    items: OrderItemDto[];
    total: number;
}

@Injectable()
export class PrinterService {
    private readonly IP = '192.168.0.119';
    private readonly PORT = 9100;

    print(order: PrintOrderDto): Promise<void> {
        return new Promise((resolve, reject) => {
            const ESC = '\x1B';
            const GS = '\x1D';
            const LF = '\n';

            let d = '';
            d += ESC + '@';
            d += ESC + 'a\x01';
            d += ESC + '!\x38';
            d += 'RESTORAN' + LF;
            d += ESC + '!\x00';
            d += '================================' + LF;
            d += ESC + 'a\x00';
            d += `Xona    : ${order.room}` + LF;
            d += `Afisant : ${order.waiter}` + LF;
            d += `Sana    : ${new Date().toLocaleString('uz-UZ')}` + LF;
            d += '--------------------------------' + LF;

            order.items.forEach((item) => {
                if (item.status === 'CANCELED') return;
                const left = `${item.name} x${item.count}`;
                const right = `${(item.price * item.count).toLocaleString()} so'm`;
                d += left + ' '.repeat(Math.max(1, 32 - left.length - right.length)) + right + LF;
            });

            d += '================================' + LF;
            d += ESC + '!\x08';
            const tl = 'JAMI:';
            const tr = `${order.total.toLocaleString()} so'm`;
            d += tl + ' '.repeat(Math.max(1, 32 - tl.length - tr.length)) + tr + LF;
            d += ESC + '!\x00';
            d += LF + LF + LF;
            d += GS + 'V\x41\x10';

            const client = new net.Socket();
            client.setTimeout(5000);

            console.log(`[PrinterService] Ulanish: ${this.IP}:${this.PORT}`);

            client.connect(this.PORT, this.IP, () => {
                console.log('[PrinterService] Connected to printer, sending data...');
                client.write(Buffer.from(d, 'binary'), () => {
                    console.log('[PrinterService] Data sent, closing connection.');
                    client.destroy();
                    resolve();
                });
            });

            client.on('timeout', () => {
                console.error('[PrinterService] Printer timeout');
                client.destroy();
                reject(new Error('Printer timeout'));
            });

            client.on('error', (e) => {
                console.error('[PrinterService] Error:', e.message);
                client.destroy();
                reject(e);
            });

            client.on('close', () => {
                console.log('[PrinterService] Connection closed.');
            });
        });
    }
}
