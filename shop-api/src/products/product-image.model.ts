import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Product } from './product.model';

interface ProductImageCreationAttrs {
  productId: number;
  image: string;
  title: string;
}

@Table({ tableName: 'product_images' })
export class ProductImage extends Model<ProductImage, ProductImageCreationAttrs> {
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
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare image: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  @BelongsTo(() => Product)
  declare product: Product;
}
