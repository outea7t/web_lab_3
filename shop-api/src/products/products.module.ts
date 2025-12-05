import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './product.model';
import { ProductProperty } from './product-property.model';
import { ProductImage } from './product-image.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { JwtSharedModule } from 'src/auth/jwt-shared.module';
import { ProductReview } from 'src/products/product-review.model';
import { ProductReviewsService } from './product-reviews.service';
import { ProductReviewsController } from './product-reviews.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product, 
      ProductProperty, 
      ProductImage,
      ProductReview
    ]),
    JwtSharedModule
  ],
  providers: [ProductsService, ProductReviewsService],
  controllers: [ProductsController, ProductReviewsController],
})
export class ProductsModule {}
