import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ProductType } from './products/entities/product.entity';

describe('E-commerce & Booking API (Integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  const sessionId = 'test-session-e2e-12345';

  beforeAll(async () => {
    process.env.DB_SQLITE_PATH = './data/test-ecommerce.sqlite';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /produtos deve retornar produtos físicos e de booking', async () => {
    const res = await request(app.getHttpServer()).get('/produtos').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(6);

    const hasPhysical = res.body.some((p: any) => p.type === ProductType.PHYSICAL);
    const hasBooking = res.body.some((p: any) => p.type === ProductType.BOOKING);
    expect(hasPhysical).toBe(true);
    expect(hasBooking).toBe(true);
  });

  it('POST /carrinho e PUT /carrinho devem gerenciar itens físicos e de booking corretamente', async () => {
    const productsRes = await request(app.getHttpServer()).get('/produtos');
    const physicalProduct = productsRes.body.find(
      (p: any) => p.type === ProductType.PHYSICAL,
    );
    const bookingProduct = productsRes.body.find(
      (p: any) => p.type === ProductType.BOOKING,
    );

    // 1. Adiciona produto físico
    const addPhysRes = await request(app.getHttpServer())
      .post('/carrinho')
      .set('x-session-id', sessionId)
      .send({
        productId: physicalProduct.id,
        quantity: 2,
      })
      .expect(201);

    expect(addPhysRes.body.items.length).toBe(1);
    expect(addPhysRes.body.items[0].quantity).toBe(2);
    expect(addPhysRes.body.items[0].subtotal).toBeCloseTo(
      physicalProduct.price * 2,
      2,
    );

    // 2. Tenta adicionar produto de booking sem data/horário -> deve falhar (400)
    await request(app.getHttpServer())
      .post('/carrinho')
      .set('x-session-id', sessionId)
      .send({
        productId: bookingProduct.id,
        quantity: 1,
      })
      .expect(400);

    // 3. Adiciona produto de booking com data e horário válidos
    const validSlot = bookingProduct.availableSlots[0];
    const addBookingRes = await request(app.getHttpServer())
      .post('/carrinho')
      .set('x-session-id', sessionId)
      .send({
        productId: bookingProduct.id,
        quantity: 1,
        booking: {
          checkInDate: '2026-12-15',
          checkInTime: validSlot,
          guests: 2,
          notes: 'Reserva de teste automatizado',
        },
      })
      .expect(201);

    expect(addBookingRes.body.items.length).toBe(2);
    expect(addBookingRes.body.totalItems).toBe(3);

    // 4. Atualiza quantidade via PUT /carrinho
    const firstItemId = addBookingRes.body.items[0].itemId;
    const updateRes = await request(app.getHttpServer())
      .put('/carrinho')
      .set('x-session-id', sessionId)
      .send({
        itemId: firstItemId,
        quantity: 3,
      })
      .expect(200);

    expect(updateRes.body.items[0].quantity).toBe(3);
  });

  it('POST /finalizar-compra deve registrar venda no banco, esvaziar o carrinho e disparar confirmação por e-mail', async () => {
    const checkoutRes = await request(app.getHttpServer())
      .post('/finalizar-compra')
      .set('x-session-id', sessionId)
      .send({
        customerName: 'Cliente Teste FullStack',
        customerEmail: 'cliente.teste@example.com',
        customerPhone: '11999998888',
        shippingAddress: 'Av. Paulista, 1000 - São Paulo, SP',
        paymentMethod: 'PIX',
      })
      .expect(201);

    expect(checkoutRes.body.order).toBeDefined();
    expect(checkoutRes.body.order.orderNumber).toMatch(/^NS-/);
    expect(checkoutRes.body.order.items.length).toBe(2);
    expect(checkoutRes.body.email.sent).toBe(true);

    // Verifica que o carrinho foi limpo após finalizar a compra
    const cartAfter = await request(app.getHttpServer())
      .get('/carrinho')
      .set('x-session-id', sessionId)
      .expect(200);

    expect(cartAfter.body.items.length).toBe(0);
    expect(cartAfter.body.totalAmount).toBe(0);
  });
});
