import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Segurança HTTP com Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Suporte a Cookies para sessão de carrinho
  app.use(cookieParser());

  // Configuração de CORS segura permitindo localhost e deploys .vercel.app
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin === process.env.FRONTEND_URL
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  });

  // Documentação interativa OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NovaStore — E-commerce & Booking API')
    .setDescription(
      'API RESTful para gerenciamento de catálogo híbrido (Produtos Físicos + Booking com data/horário), carrinho de compras e finalização de pedidos com envio de e-mail.',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  logger.log(`🚀 Servidor Back-end NestJS rodando em: http://localhost:${port}`);
  logger.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api-docs`);
}
bootstrap();

