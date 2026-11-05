import {
  BookingMetadata,
  CartItem,
  CartState,
  OrderResponse,
  OrderSummary,
  Product,
  ProductType,
} from '@/types/ecommerce';
import { CheckoutFormValues } from './schemas';

const INITIAL_CATALOG: Product[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Fone Bluetooth Noise Cancelling Pro X',
    description:
      'Cancelamento ativo de ruído de nível de estúdio, bateria de até 45h com carregamento rápido USB-C e áudio espacial de alta fidelidade.',
    price: 899.9,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    category: 'Eletrônicos',
    type: 'PHYSICAL',
    stock: 25,
    availableSlots: null,
    locationOrDuration: 'Envio Imediato • Garantia 1 ano',
    rating: 4.9,
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    name: 'Teclado Mecânico Wireless Custom 75%',
    description:
      'Switches táteis lubrificados de fábrica, estrutura em alumínio CNC, conexão Tri-Mode (Bluetooth 5.1, 2.4GHz e USB-C) e keycaps PBT.',
    price: 649.0,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    category: 'Periféricos',
    type: 'PHYSICAL',
    stock: 18,
    availableSlots: null,
    locationOrDuration: 'Envio Imediato • Layout ANSI',
    rating: 4.8,
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    name: 'Smartwatch Titanium Ultra GPS',
    description:
      'Caixa em titânio aeroespacial, tela AMOLED de 2000 nits, monitoramento avançado de saúde, ECG e resistência à água 100m.',
    price: 1590.0,
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    category: 'Wearables',
    type: 'PHYSICAL',
    stock: 12,
    availableSlots: null,
    locationOrDuration: 'Envio Imediato • Pulseira Extra',
    rating: 4.9,
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    name: 'Kit Café Especial Torra Artesanal + Moedor Inox',
    description:
      'Grãos 100% Arábica da Serra da Mantiqueira (86 pontos SCA) acompanhados de moedor manual com mós cônicas de inox.',
    price: 239.9,
    imageUrl:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80',
    category: 'Lifestyle',
    type: 'PHYSICAL',
    stock: 40,
    availableSlots: null,
    locationOrDuration: 'Torra fresca semanal • 500g + Moedor',
    rating: 4.7,
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    name: 'Cabana Alpina Glass & Spa — Campos do Jordão (Diária)',
    description:
      'Experiência de hospedagem exclusiva com teto panorâmico de vidro, hidromassagem aquecida com vista para o vale, lareira ecológica e café da manhã artesanal.',
    price: 780.0,
    imageUrl:
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=900&q=80',
    category: 'Hospedagem & Booking',
    type: 'BOOKING',
    stock: 10,
    availableSlots: ['14:00', '15:00', '16:00', '18:00'],
    locationOrDuration: 'Campos do Jordão, SP • Check-in c/ Welcome Drink',
    rating: 5.0,
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    name: 'Sessão de Estúdio Fotográfico & Produção Audiovisual',
    description:
      'Reserva de estúdio completo com ciclorama infinito, iluminação profissional Aputure, camarim climatizado e assistência de iluminação.',
    price: 420.0,
    imageUrl:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
    category: 'Estúdio & Booking',
    type: 'BOOKING',
    stock: 15,
    availableSlots: ['09:00', '11:00', '14:00', '16:30', '19:00'],
    locationOrDuration: 'Vila Madalena, SP • Sessão de 2 horas',
    rating: 4.9,
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    name: 'Mentoria Arquitetura Full Stack & Cloud (1-on-1)',
    description:
      'Sessão ao vivo de revisão de código, arquitetura com NestJS, Next.js, bancos relacionais e preparação prática para desafios técnicos.',
    price: 290.0,
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    category: 'Consultoria & Booking',
    type: 'BOOKING',
    stock: 20,
    availableSlots: ['10:00', '13:30', '16:00', '19:30', '21:00'],
    locationOrDuration: 'Online via Google Meet • Duração: 90 min',
    rating: 5.0,
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    name: 'Mochila Impermeável Tech Commuter 28L',
    description:
      'Compartimento acolchoado para notebook até 16", tecido balístico Cordura resistente à chuva, bolso antifurto e saída USB integrada.',
    price: 389.9,
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    category: 'Lifestyle',
    type: 'PHYSICAL',
    stock: 30,
    availableSlots: null,
    locationOrDuration: 'Envio Imediato • Impermeável IPX4',
    rating: 4.8,
  },
];

const PRODUCTS_KEY = 'novastore_fallback_products_v1';
const CART_KEY = 'novastore_fallback_cart_v1';
const ORDERS_KEY = 'novastore_fallback_orders_v1';

function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_CATALOG;
  const raw = window.localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_CATALOG));
    return INITIAL_CATALOG;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATALOG;
  }
}

function saveStoredProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getStoredCartItems(sessionId: string): CartItem[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(`${CART_KEY}_${sessionId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredCartItems(sessionId: string, items: CartItem[]): CartState {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      `${CART_KEY}_${sessionId}`,
      JSON.stringify(items),
    );
  }
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = Number(
    items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2),
  );
  return {
    sessionId,
    items,
    totalItems,
    totalAmount,
    updatedAt: new Date().toISOString(),
  };
}

function createEmailHtmlPreviewDataUrl(order: OrderSummary): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
          <strong>${i.productName}</strong>
          ${
            i.bookingDetails
              ? `<div style="font-size:12px;color:#4f46e5;">Check-in: ${i.bookingDetails.checkInDate} às ${i.bookingDetails.checkInTime} (${i.bookingDetails.guests} pessoas)</div>`
              : ''
          }
        </td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">R$ ${i.subtotal.toFixed(2)}</td>
      </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Recibo #${order.orderNumber}</title></head><body style="font-family:sans-serif;background:#f1f5f9;padding:30px;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px;"><h2>Pedido #${order.orderNumber} Confirmado! 🎉</h2><p>Olá, <strong>${order.customerName}</strong>! Seu comprovante foi enviado para <strong>${order.customerEmail}</strong>.</p></div><div style="padding:24px;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f8fafc;text-align:left;"><th style="padding:10px;">Item</th><th style="padding:10px;text-align:center;">Qtd</th><th style="padding:10px;text-align:right;">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><h3 style="text-align:right;margin-top:20px;color:#4f46e5;">Total Pago (${order.paymentMethod}): R$ ${order.totalAmount.toFixed(2)}</h3></div></div></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export const fallbackStore = {
  getProducts(params?: {
    type?: ProductType | 'ALL';
    category?: string;
    search?: string;
  }): Product[] {
    let list = getStoredProducts();
    if (params?.type && params.type !== 'ALL') {
      list = list.filter((p) => p.type === params.type);
    }
    if (params?.category && params.category !== 'ALL') {
      list = list.filter((p) => p.category === params.category);
    }
    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  },

  getCart(sessionId: string): CartState {
    const items = getStoredCartItems(sessionId);
    return saveStoredCartItems(sessionId, items);
  },

  addToCart(
    sessionId: string,
    payload: {
      productId: string;
      quantity: number;
      booking?: BookingMetadata;
    },
  ): CartState {
    const products = getStoredProducts();
    const product = products.find((p) => p.id === payload.productId);
    if (!product) throw new Error('Produto não encontrado.');

    if (product.type === 'BOOKING' && !payload.booking) {
      throw new Error('Selecione data e horário de check-in.');
    }

    const items = getStoredCartItems(sessionId);
    const existingIndex = items.findIndex((i) => {
      if (i.productId !== product.id) return false;
      if (product.type === 'BOOKING') {
        return (
          i.booking?.checkInDate === payload.booking?.checkInDate &&
          i.booking?.checkInTime === payload.booking?.checkInTime
        );
      }
      return true;
    });

    if (existingIndex >= 0) {
      items[existingIndex].quantity += payload.quantity;
      items[existingIndex].subtotal = Number(
        (items[existingIndex].quantity * product.price).toFixed(2),
      );
    } else {
      items.push({
        itemId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        type: product.type,
        unitPrice: product.price,
        quantity: payload.quantity,
        subtotal: Number((payload.quantity * product.price).toFixed(2)),
        booking: payload.booking,
      });
    }

    return saveStoredCartItems(sessionId, items);
  },

  updateCartItem(
    sessionId: string,
    payload: { itemId: string; quantity: number },
  ): CartState {
    const items = getStoredCartItems(sessionId);
    const idx = items.findIndex((i) => i.itemId === payload.itemId);
    if (idx === -1) return saveStoredCartItems(sessionId, items);

    if (payload.quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = payload.quantity;
      items[idx].subtotal = Number(
        (payload.quantity * items[idx].unitPrice).toFixed(2),
      );
    }
    return saveStoredCartItems(sessionId, items);
  },

  clearCart(sessionId: string): CartState {
    return saveStoredCartItems(sessionId, []);
  },

  checkout(sessionId: string, payload: CheckoutFormValues): OrderResponse {
    const items = getStoredCartItems(sessionId);
    if (items.length === 0) {
      throw new Error('Sua sacola está vazia.');
    }

    const products = getStoredProducts();
    for (const item of items) {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }
    saveStoredProducts(products);

    const totalAmount = Number(
      items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2),
    );
    const orderNumber = `NS-${Date.now().toString(36).toUpperCase().slice(-5)}`;

    const newOrder: OrderSummary = {
      id: `${Date.now()}`,
      orderNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone || null,
      shippingAddress: payload.shippingAddress || null,
      paymentMethod: payload.paymentMethod,
      totalAmount,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      items: items.map((i, idx) => ({
        id: `${idx}-${Date.now()}`,
        productId: i.productId,
        productName: i.name,
        productType: i.type,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        subtotal: i.subtotal,
        bookingDetails: i.booking || null,
      })),
    };

    const previewUrl = createEmailHtmlPreviewDataUrl(newOrder);
    newOrder.emailPreviewUrl = previewUrl;

    const existingOrders = this.getOrders();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([newOrder, ...existingOrders]),
      );
    }

    this.clearCart(sessionId);

    return {
      message:
        'Compra finalizada com sucesso! Um e-mail de confirmação foi enviado com os detalhes do pedido.',
      order: newOrder,
      email: {
        sent: true,
        recipient: newOrder.customerEmail,
        previewUrl,
      },
    };
  },

  getOrders(): OrderSummary[] {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
