import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductReview } from './product-review.model';
import { Product } from './product.model';
import { CreateReviewDto } from './schemas/product-review.schemas';

@Injectable()
export class ProductReviewsService {
  constructor(
    @InjectModel(ProductReview)
    private reviewModel: typeof ProductReview,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async create(
    productId: number,
    dto: CreateReviewDto,
  ): Promise<ProductReview> {
    // проверим, что товар существует
    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return this.reviewModel.create({
      productId,
      authorName: dto.authorName,
      rating: dto.rating,
      text: dto.text,
    });
  }

  async findByProduct(productId: number): Promise<ProductReview[]> {
    return this.reviewModel.findAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
    });
  }

  async remove(productId: number, reviewId: number): Promise<void> {
    const review = await this.reviewModel.findOne({
      where: { id: reviewId, productId },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    await review.destroy();
  }
}
