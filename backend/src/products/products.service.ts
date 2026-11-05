import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(filters?: {
    type?: ProductType;
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (filters?.type) {
      query.andWhere('product.type = :type', { type: filters.type });
    }

    if (filters?.category && filters.category !== 'ALL') {
      query.andWhere('product.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search OR LOWER(product.category) LIKE :search)',
        { search: searchTerm },
      );
    }

    query.orderBy('product.createdAt', 'ASC');
    const items = await query.getMany();

    return items.map((item) => ({
      ...item,
      price: Number(item.price),
      rating: Number(item.rating),
    }));
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return {
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
    };
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    const product = await this.findOne(id);
    if (product.stock < quantity) {
      throw new NotFoundException(
        `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}`,
      );
    }
    product.stock -= quantity;
    await this.productRepository.save(product);
  }
}

