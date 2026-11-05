import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { MailModule } from './mail/mail.module';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { SeedService } from './database/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting contra abuso / brute-force (máximo 120 requisições por minuto por IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbType = (
          config.get<string>('DB_TYPE') || 'sqljs'
        ).toLowerCase();

        const entities = [Product, Order, OrderItem];

        if (dbType === 'postgres' || dbType === 'mysql') {
          return {
            type: dbType as 'postgres' | 'mysql',
            host: config.get<string>('DB_HOST') || 'localhost',
            port: Number(
              config.get<string>('DB_PORT') ||
                (dbType === 'postgres' ? 5432 : 3306),
            ),
            username: config.get<string>('DB_USER') || 'postgres',
            password: config.get<string>('DB_PASS') || 'postgres',
            database: config.get<string>('DB_NAME') || 'desafio_ecommerce',
            entities,
            synchronize: true,
          };
        }

        // Default zero-config: SQLite Relacional via sql.js persistido em disco (ou /tmp em ambiente Serverless Vercel)
        const isVercel = Boolean(process.env.VERCEL);
        const sqlitePath = isVercel
          ? '/tmp/ecommerce.sqlite'
          : path.resolve(
              process.cwd(),
              config.get<string>('DB_SQLITE_PATH') || './data/ecommerce.sqlite',
            );
        const dir = path.dirname(sqlitePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        return {
          type: 'sqljs',
          location: sqlitePath,
          autoSave: true,
          entities,
          synchronize: true,
        };
      },
    }),
    ProductsModule,
    CartModule,
    OrdersModule,
    MailModule,
  ],
  providers: [
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

