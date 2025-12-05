import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductReviewsService } from './product-reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createReviewSchema,
  CreateReviewDto,
} from './schemas/product-review.schemas';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

class ProductReviewSwaggerDto {
  readonly id: number;
  readonly productId: number;
  readonly authorName: string;
  readonly rating: number;
  readonly text: string;
}

@ApiTags('Product reviews')
@ApiBearerAuth()
@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ProductReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Список отзывов по товару' })
  @ApiOkResponse({ type: [ProductReviewSwaggerDto] })
  async list(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.findByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Добавить отзыв к товару' })
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body(new ZodValidationPipe(createReviewSchema)) body: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, body);
  }

    // Только admin может удалить
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Удалить отзыв (только admin)' })
  async remove(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    await this.reviewsService.remove(productId, reviewId);
    return { success: true };
  }
}
