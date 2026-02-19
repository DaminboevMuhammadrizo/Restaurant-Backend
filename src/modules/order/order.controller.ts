import { Controller, Get, Post, Body, Patch, Param, Query, Req, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserRole, OrderStatus } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtPayload } from 'src/common/config/jwt/jwt.service';
import { GetOrdersDto } from './dto/get.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }


    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.MANAGER}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPERADMIN)
    @Get('branch/:branchId')
    getAllForManager(
        @Param('branchId', ParseUUIDPipe) branchId: string,
        @Query() query: GetOrdersDto,
        @Req() req: Request
    ) {
        return this.orderService.getAllForManager(req['user'] as JwtPayload, query, branchId);
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}, ${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA, UserRole.SUPER_AFITSANT)
    @Get('my')
    getAllForStaff(@Query() query: GetOrdersDto, @Req() req: Request) {
        return this.orderService.getAllForStaff(req['user'] as JwtPayload, query);
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}, ${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_AFITSANT, UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA)
    @Post()
    createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
        return this.orderService.create(dto, req['user'] as JwtPayload);
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}, ${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_AFITSANT, UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA)
    @Patch(':id')
    updateOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto, @Req() req: Request) {
        return this.orderService.updateOrder(id, dto, req['user'] as JwtPayload);
    }


    @ApiOperation({ summary: `${UserRole.SUPER_AFITSANT}, ${UserRole.AFITSANT}, ${UserRole.CHEF}, ${UserRole.KASSA}` })
    @ApiBearerAuth()
    @ApiQuery({ name: 'status', enum: OrderStatus, description: 'PENDING, SUCCESS, CANCELED' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_AFITSANT, UserRole.AFITSANT, UserRole.CHEF, UserRole.KASSA)
    @Patch('status/:orderId')
    updateStatus(
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Query('status') status: OrderStatus,
        @Req() req: Request
    ) {
        return this.orderService.changeStatus(orderId, status, req['user'] as JwtPayload);
    }
}
