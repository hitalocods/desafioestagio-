import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  BOOKING = 'BOOKING',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 500 })
  imageUrl: string;

  @Column({ length: 80 })
  category: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ProductType.PHYSICAL,
  })
  type: ProductType;

  @Column({ type: 'int', default: 50 })
  stock: number;

  @Column({ type: 'simple-json', nullable: true })
  availableSlots: string[] | null;

  @Column({ length: 120, nullable: true })
  locationOrDuration: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.9 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

