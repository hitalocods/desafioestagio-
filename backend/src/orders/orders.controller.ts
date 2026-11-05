import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CheckoutDto, checkoutSchema } from './orders.schemas';
import { OrdersService } from './orders.service';

@ApiTags('Checkout / Pedidos')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('finalizar-compra')
  @ApiOperation({
    summary:
      'Finaliza a compra, salva o pedido e itens no banco de dados relacional e envia e-mail de confirmação',
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'ID da sessão do carrinho do cliente',
    required: false,
  })
  async checkout(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Body(new ZodValidationPipe(checkoutSchema)) body: CheckoutDto,
  ) {
    const cookieSessionId = req.cookies?.['cart_session_id'];
    const sessionId =
      headerSessionId?.trim() || cookieSessionId || uuidv4();
    return this.ordersService.checkout(sessionId, body);
  }

  @Get('pedidos')
  @ApiOperation({
    summary: 'Lista o histórico de vendas registradas no banco de dados',
  })
  async findAllOrders() {
    return this.ordersService.findAllOrders();
  }
}

