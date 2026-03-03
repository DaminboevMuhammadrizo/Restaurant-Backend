// src/infra/printer/printer.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PrinterService, PrintOrderDto, OrderItemDto } from './printer.service';
import { CreatePrintOrderDto } from './dto/PrinterOrder.dto';

@Controller('print')
export class PrinterController {
    constructor(private readonly printerService: PrinterService) { }

    @Post()
    async print(@Body() dto: CreatePrintOrderDto) {
        // productId orqali DB yoki service dan ma'lumot olish
        const items: OrderItemDto[] = dto.items.map(item => {
            const product = getProduct(item.productId);
            return {
                name: product.name,
                count: item.count,
                price: product.price,
                status: 'prepared',
            };
        });

        const total = items.reduce((acc, i) => acc + i.price * i.count, 0);

        const printDto: PrintOrderDto = {
            room: dto.room,
            waiter: dto.waiter,
            items,
            total,
        };

        await this.printerService.print(printDto);
    }
}

// Misol getProduct funksiyasi
function getProduct(productId: string) {
    const products = [
        { id: 'abc123', name: 'Burger', price: 15000 },
        { id: 'def456', name: 'Pizza', price: 25000 },
    ];
    return products.find(p => p.id === productId) || { name: 'Unknown', price: 0 };
}
