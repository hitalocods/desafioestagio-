import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProductsService } from '../products/products.service';
import { ProductType } from '../products/entities/product.entity';
import {
  AddToCartDto,
  CartItem,
  CartState,
  UpdateCartItemDto,
} from './cart.schemas';

@Injectable()
export class CartService {
  // Armazenamento em memória indexado por sessionId (suporta múltiplas sessões/usuários simultâneos)
  private readonly carts = new Map<string, CartItem[]>();

  constructor(private readonly productsService: ProductsService) {}

  private buildCartState(sessionId: string): CartState {
    const items = this.carts.get(sessionId) ?? [];
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = Number(
      items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2),
    );

    return {
      sessionId,
      items,
      totalItems,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };
  }

  getCart(sessionId: string): CartState {
    if (!this.carts.has(sessionId)) {
      this.carts.set(sessionId, []);
    }
    return this.buildCartState(sessionId);
  }

  async addItem(sessionId: string, dto: AddToCartDto): Promise<CartState> {
    const product = await this.productsService.findOne(dto.productId);

    if (product.type === ProductType.BOOKING && !dto.booking) {
      throw new BadRequestException(
        `O item "${product.name}" é do tipo Booking e exige seleção de data e horário de check-in.`,
      );
    }

    if (
      product.type === ProductType.BOOKING &&
      dto.booking &&
      product.availableSlots?.length &&
      !product.availableSlots.includes(dto.booking.checkInTime)
    ) {
      throw new BadRequestException(
        `Horário "${dto.booking.checkInTime}" indisponível para "${product.name}". Horários aceitos: ${product.availableSlots.join(', ')}`,
      );
    }

    const currentItems = this.carts.get(sessionId) ?? [];

    // Produtos físicos iguais se agrupam; Bookings com mesma data e horário também se agrupam, senão criam linha própria
    const existingIndex = currentItems.findIndex((item) => {
      if (item.productId !== product.id) return false;
      if (product.type === ProductType.BOOKING) {
        return (
          item.booking?.checkInDate === dto.booking?.checkInDate &&
          item.booking?.checkInTime === dto.booking?.checkInTime
        );
      }
      return true;
    });

    const unitPrice = Number(product.price);

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      const nextQuantity = existing.quantity + dto.quantity;

      if (nextQuantity > product.stock) {
        throw new BadRequestException(
          `Quantidade solicitada (${nextQuantity}) excede a disponibilidade (${product.stock}) de "${product.name}".`,
        );
      }

      existing.quantity = nextQuantity;
      existing.subtotal = Number((existing.quantity * unitPrice).toFixed(2));
      if (dto.booking?.notes) {
        existing.booking = {
          ...existing.booking!,
          guests: dto.booking.guests,
          notes: dto.booking.notes,
        };
      }
      currentItems[existingIndex] = existing;
    } else {
      if (dto.quantity > product.stock) {
        throw new BadRequestException(
          `Quantidade solicitada (${dto.quantity}) excede a disponibilidade (${product.stock}) de "${product.name}".`,
        );
      }

      const newItem: CartItem = {
        itemId: uuidv4(),
        productId: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        type: product.type,
        unitPrice,
        quantity: dto.quantity,
        subtotal: Number((dto.quantity * unitPrice).toFixed(2)),
        booking:
          product.type === ProductType.BOOKING ? dto.booking : undefined,
      };
      currentItems.push(newItem);
    }

    this.carts.set(sessionId, currentItems);
    return this.buildCartState(sessionId);
  }

  async updateItem(
    sessionId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartState> {
    const currentItems = this.carts.get(sessionId) ?? [];
    const targetIndex = currentItems.findIndex((item) =>
      dto.itemId
        ? item.itemId === dto.itemId
        : item.productId === dto.productId,
    );

    if (targetIndex === -1) {
      throw new NotFoundException('Item não encontrado no carrinho.');
    }

    // Se quantidade == 0, remove o item do carrinho
    if (dto.quantity <= 0) {
      currentItems.splice(targetIndex, 1);
      this.carts.set(sessionId, currentItems);
      return this.buildCartState(sessionId);
    }

    const targetItem = currentItems[targetIndex];
    const product = await this.productsService.findOne(targetItem.productId);

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Estoque máximo disponível para "${product.name}" é ${product.stock}.`,
      );
    }

    targetItem.quantity = dto.quantity;
    targetItem.subtotal = Number(
      (targetItem.quantity * targetItem.unitPrice).toFixed(2),
    );
    currentItems[targetIndex] = targetItem;
    this.carts.set(sessionId, currentItems);

    return this.buildCartState(sessionId);
  }

  removeItem(sessionId: string, itemId: string): CartState {
    const currentItems = this.carts.get(sessionId) ?? [];
    const filtered = currentItems.filter(
      (item) => item.itemId !== itemId && item.productId !== itemId,
    );
    this.carts.set(sessionId, filtered);
    return this.buildCartState(sessionId);
  }

  clearCart(sessionId: string): CartState {
    this.carts.set(sessionId, []);
    return this.buildCartState(sessionId);
  }
}

