import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 40, unique: true })
  orderNumber: string;

  @Column({ length: 140 })
  customerName: string;

  @Column({ length: 180 })
  customerEmail: string;

  @Column({ length: 40, nullable: true })
  customerPhone: string | null;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string | null;

  @Column({ length: 40, default: 'PIX' })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ length: 30, default: 'CONFIRMED' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  emailPreviewUrl: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}

