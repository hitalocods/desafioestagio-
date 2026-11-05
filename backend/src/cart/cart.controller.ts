import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  AddToCartDto,
  addToCartSchema,
  UpdateCartItemDto,
  updateCartItemSchema,
} from './cart.schemas';
import { CartService } from './cart.service';

@ApiTags('Carrinho')
@ApiHeader({
  name: 'x-session-id',
  description: 'Identificador da sessão do carrinho do cliente',
  required: false,
})
@Controller('carrinho')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private resolveSessionId(
    headerSessionId: string | undefined,
    req: Request,
    res: Response,
  ): string {
    const cookieSessionId = req.cookies?.['cart_session_id'];
    const sessionId =
      headerSessionId?.trim() || cookieSessionId || uuidv4();

    res.cookie('cart_session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });

    return sessionId;
  }

  @Get()
  @ApiOperation({ summary: 'Visualiza o carrinho atual da sessão' })
  getCart(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(headerSessionId, req, res);
    return this.cartService.getCart(sessionId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Adiciona um produto físico ou agendamento (booking) ao carrinho',
  })
  async addToCart(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(addToCartSchema)) body: AddToCartDto,
  ) {
    const sessionId = this.resolveSessionId(headerSessionId, req, res);
    return this.cartService.addItem(sessionId, body);
  }

  @Put()
  @ApiOperation({
    summary:
      'Atualiza a quantidade de um item ou o remove caso quantity seja 0',
  })
  async updateCartItem(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(updateCartItemSchema)) body: UpdateCartItemDto,
  ) {
    const sessionId = this.resolveSessionId(headerSessionId, req, res);
    return this.cartService.updateItem(sessionId, body);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove individualmente um item do carrinho' })
  removeItem(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
  ) {
    const sessionId = this.resolveSessionId(headerSessionId, req, res);
    return this.cartService.removeItem(sessionId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Esvazia todo o carrinho da sessão atual' })
  clearCart(
    @Headers('x-session-id') headerSessionId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.resolveSessionId(headerSessionId, req, res);
    return this.cartService.clearCart(sessionId);
  }
}

