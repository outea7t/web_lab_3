import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Product } from './product.model';

interface ProductPropertyCreationAttrs {
  productId: number;
  propertyName: string;
  propertyValue: string;
  propertyPrice: number;
}

@Table({ tableName: 'product_properties' })
export class ProductProperty extends Model<ProductProperty, ProductPropertyCreationAttrs> {
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
    field: 'property_name',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare propertyName: string;

  @Column({
    field: 'property_value',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare propertyValue: string;

  @Column({
    field: 'property_price',
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  declare propertyPrice: string;

  @BelongsTo(() => Product)
  declare product: Product;
}
