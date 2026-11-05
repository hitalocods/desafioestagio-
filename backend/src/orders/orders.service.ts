import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CheckoutDto } from './orders.schemas';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';
import { Product, ProductType } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly mailService: MailService,
  ) {}

  private generateOrderNumber(): string {
    const timestampPart = Date.now().toString(36).toUpperCase().slice(-5);
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NS-${timestampPart}${randomPart}`;
  }

  async checkout(sessionId: string, dto: CheckoutDto) {
    // 1. Obtém itens da sessão do carrinho ou do payload enviado pelo front-end
    const sessionCart = this.cartService.getCart(sessionId);

    let itemsToProcess = sessionCart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      booking: item.booking,
    }));

    if (itemsToProcess.length === 0 && dto.items && dto.items.length > 0) {
      itemsToProcess = dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        booking: item.booking,
      }));
    }

    if (itemsToProcess.length === 0) {
      throw new BadRequestException(
        'O carrinho está vazio. Adicione produtos antes de finalizar a compra.',
      );
    }

    // 2. Valida produtos, estoque e exigência de endereço para itens físicos
    const orderItemsEntities: OrderItem[] = [];
    let calculatedTotal = 0;
    let hasPhysicalProduct = false;

    for (const rawItem of itemsToProcess) {
      const product = await this.productsService.findOne(rawItem.productId);

      if (product.stock < rawItem.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, solicitado: ${rawItem.quantity}.`,
        );
      }

      if (product.type === ProductType.BOOKING && !rawItem.booking) {
        throw new BadRequestException(
          `O item "${product.name}" requer data e horário de check-in (Booking).`,
        );
      }

      if (product.type === ProductType.PHYSICAL) {
        hasPhysicalProduct = true;
      }

      const unitPrice = Number(product.price);
      const subtotal = Number((unitPrice * rawItem.quantity).toFixed(2));
      calculatedTotal = Number((calculatedTotal + subtotal).toFixed(2));

      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.productName = product.name;
      orderItem.productType = product.type;
      orderItem.unitPrice = unitPrice;
      orderItem.quantity = rawItem.quantity;
      orderItem.subtotal = subtotal;
      orderItem.bookingDetails = rawItem.booking ?? null;

      orderItemsEntities.push(orderItem);
    }

    if (
      hasPhysicalProduct &&
      (!dto.shippingAddress || dto.shippingAddress.trim().length < 5)
    ) {
      throw new BadRequestException(
        'Informe o endereço de entrega para os produtos físicos do pedido.',
      );
    }

    // 3. Executa gravação transacional no banco relacional + baixa de estoque
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      for (const item of orderItemsEntities) {
        const product = await this.productsService.findOne(item.productId);
        product.stock -= item.quantity;
        await manager.save(Product, product);
      }

      const order = new Order();
      order.orderNumber = this.generateOrderNumber();
      order.customerName = dto.customerName.trim();
      order.customerEmail = dto.customerEmail.trim().toLowerCase();
      order.customerPhone = dto.customerPhone?.trim() || null;
      order.shippingAddress = dto.shippingAddress?.trim() || null;
      order.paymentMethod = dto.paymentMethod;
      order.totalAmount = calculatedTotal;
      order.status = 'CONFIRMED';
      order.items = orderItemsEntities;

      return manager.save(Order, order);
    });

    // 4. Dispara e-mail de confirmação com os detalhes da compra
    const emailResult = await this.mailService.sendOrderConfirmation(savedOrder);
    if (emailResult.previewUrl) {
      savedOrder.emailPreviewUrl = emailResult.previewUrl;
      await this.orderRepository.save(savedOrder);
    }

    // 5. Limpa o carrinho da sessão
    this.cartService.clearCart(sessionId);

    return {
      message:
        'Compra finalizada com sucesso! Um e-mail de confirmação foi enviado com os detalhes do pedido.',
      order: {
        id: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        customerName: savedOrder.customerName,
        customerEmail: savedOrder.customerEmail,
        customerPhone: savedOrder.customerPhone,
        shippingAddress: savedOrder.shippingAddress,
        paymentMethod: savedOrder.paymentMethod,
        totalAmount: Number(savedOrder.totalAmount),
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
        items: savedOrder.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          productType: i.productType,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
          bookingDetails: i.bookingDetails,
        })),
      },
      email: {
        sent: emailResult.sent,
        recipient: savedOrder.customerEmail,
        previewUrl: emailResult.previewUrl,
      },
    };
  }

  async findAllOrders() {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    }));
  }
}
