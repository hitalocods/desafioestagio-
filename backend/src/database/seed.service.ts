import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from '../products/entities/product.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.productRepository.count();
    if (count > 0) {
      this.logger.log(
        `Catálogo já possui ${count} produtos registrados no banco de dados.`,
      );
      return;
    }

    this.logger.log('Populando catálogo inicial de produtos e bookings...');

    const initialProducts: Partial<Product>[] = [
      {
        name: 'Fone Bluetooth Noise Cancelling Pro X',
        description:
          'Cancelamento ativo de ruído de nível de estúdio, bateria de até 45h com carregamento rápido USB-C e áudio espacial de alta fidelidade.',
        price: 899.9,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
        category: 'Eletrônicos',
        type: ProductType.PHYSICAL,
        stock: 25,
        availableSlots: null,
        locationOrDuration: 'Envio Imediato • Garantia 1 ano',
        rating: 4.9,
      },
      {
        name: 'Teclado Mecânico Wireless Custom 75%',
        description:
          'Switches táteis lubrificados de fábrica, estrutura em alumínio CNC, conexão Tri-Mode (Bluetooth 5.1, 2.4GHz e USB-C) e keycaps PBT.',
        price: 649.0,
        imageUrl:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
        category: 'Periféricos',
        type: ProductType.PHYSICAL,
        stock: 18,
        availableSlots: null,
        locationOrDuration: 'Envio Imediato • Layout ANSI',
        rating: 4.8,
      },
      {
        name: 'Smartwatch Titanium Ultra GPS',
        description:
          'Caixa em titânio aeroespacial, tela AMOLED de 2000 nits, monitoramento avançado de saúde, ECG e resistência à água 100m.',
        price: 1590.0,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
        category: 'Wearables',
        type: ProductType.PHYSICAL,
        stock: 12,
        availableSlots: null,
        locationOrDuration: 'Envio Imediato • Pulseira Extra',
        rating: 4.9,
      },
      {
        name: 'Kit Café Especial Torra Artesanal + Moedor Inox',
        description:
          'Grãos 100% Arábica da Serra da Mantiqueira (86 pontos SCA) acompanhados de moedor manual com mós cônicas de inox.',
        price: 239.9,
        imageUrl:
          'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80',
        category: 'Lifestyle',
        type: ProductType.PHYSICAL,
        stock: 40,
        availableSlots: null,
        locationOrDuration: 'Torra fresca semanal • 500g + Moedor',
        rating: 4.7,
      },
      {
        name: 'Cabana Alpina Glass & Spa — Campos do Jordão (Diária)',
        description:
          'Experiência de hospedagem exclusiva com teto panorâmico de vidro, hidromassagem aquecida com vista para o vale, lareira ecológica e café da manhã artesanal.',
        price: 780.0,
        imageUrl:
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=900&q=80',
        category: 'Hospedagem & Booking',
        type: ProductType.BOOKING,
        stock: 10,
        availableSlots: ['14:00', '15:00', '16:00', '18:00'],
        locationOrDuration: 'Campos do Jordão, SP • Check-in c/ Welcome Drink',
        rating: 5.0,
      },
      {
        name: 'Sessão de Estúdio Fotográfico & Produção Audiovisual',
        description:
          'Reserva de estúdio completo com ciclorama infinito, iluminação profissional Aputure, camarim climatizado e assistência de iluminação.',
        price: 420.0,
        imageUrl:
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
        category: 'Estúdio & Booking',
        type: ProductType.BOOKING,
        stock: 15,
        availableSlots: ['09:00', '11:00', '14:00', '16:30', '19:00'],
        locationOrDuration: 'Vila Madalena, SP • Sessão de 2 horas',
        rating: 4.9,
      },
      {
        name: 'Mentoria Arquitetura Full Stack & Cloud (1-on-1)',
        description:
          'Sessão ao vivo de revisão de código, arquitetura com NestJS, Next.js, bancos relacionais e preparação prática para desafios técnicos.',
        price: 290.0,
        imageUrl:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
        category: 'Consultoria & Booking',
        type: ProductType.BOOKING,
        stock: 20,
        availableSlots: ['10:00', '13:30', '16:00', '19:30', '21:00'],
        locationOrDuration: 'Online via Google Meet • Duração: 90 min',
        rating: 5.0,
      },
      {
        name: 'Mochila Impermeável Tech Commuter 28L',
        description:
          'Compartimento acolchoado para notebook até 16", tecido balístico Cordura resistente à chuva, bolso antifurto e saída USB integrada.',
        price: 389.9,
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
        category: 'Lifestyle',
        type: ProductType.PHYSICAL,
        stock: 30,
        availableSlots: null,
        locationOrDuration: 'Envio Imediato • Impermeável IPX4',
        rating: 4.8,
      },
    ];

    await this.productRepository.save(initialProducts);
    this.logger.log(
      `✅ Seed concluído: ${initialProducts.length} itens (Produtos Físicos + Bookings) cadastrados!`,
    );
  }
}

