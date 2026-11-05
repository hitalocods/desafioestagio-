import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductType } from './entities/product.entity';

@ApiTags('Produtos')
@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna a lista de produtos e serviços (booking) disponíveis',
  })
  @ApiQuery({ name: 'type', required: false, enum: ProductType })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('type') type?: ProductType,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({ type, category, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca detalhes de um produto específico pelo ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}

