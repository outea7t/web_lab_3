import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { CreateProductDto } from './schemas/product.schemas';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    return this.productModel.create({
      manufacturerId: dto.manufacturerId,
      name: dto.name,
      alias: dto.alias,
      shortDescription: dto.shortDescription,
      description: dto.description,
      price: dto.price,
      image: dto.image,
      category: dto.category,
      available: dto.available ?? 1,
      metaKeywords: dto.metaKeywords,
      metaDescription: dto.metaDescription,
      metaTitle: dto.metaTitle,
    });
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.findAll({
      include: { all: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.productModel.destroy({ where: { id } });
  }
}
