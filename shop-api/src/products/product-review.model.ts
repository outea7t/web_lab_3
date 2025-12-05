import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Product } from './product.model';

export type AuthorGender = 'male' | 'female';

interface ProductReviewCreationAttrs {
  productId: number;
  authorName: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorGender?: AuthorGender;
  rating: number;
  text: string;
}

@Table({ tableName: 'product_reviews' })
export class ProductReview extends Model<ProductReview, ProductReviewCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({
    field: 'product_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @Column({
    field: 'author_name',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare authorName: string;

  @Column({
    field: 'author_first_name',
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare authorFirstName: string | null;

  @Column({
    field: 'author_last_name',
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare authorLastName: string | null;

  @Column({
    field: 'author_gender',
    type: DataType.ENUM('male', 'female'),
    allowNull: true,
  })
  declare authorGender: AuthorGender | null;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
  })
  declare rating: number; // 1–5

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare text: string;

  @BelongsTo(() => Product)
  declare product: Product;
}
