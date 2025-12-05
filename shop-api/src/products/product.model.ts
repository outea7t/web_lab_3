import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { ProductProperty } from './product-property.model';
import { ProductImage } from './product-image.model';
import { ProductCategory } from './types/product.types';
import { ProductReview } from 'src/products/product-review.model';

interface ProductCreationAttrs {
  manufacturerId: number;
  name: string;
  alias: string;
  shortDescription: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  available?: number;
  metaKeywords: string;
  metaDescription: string;
  metaTitle: string;
}

@Table({ tableName: 'products' })
export class Product extends Model<Product, ProductCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'manufacturer_id',
    type: DataType.SMALLINT,
    allowNull: false,
  })
  declare manufacturerId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare alias: string;

  @Column({
    field: 'short_description',
    type: DataType.TEXT,
    allowNull: false,
  })
  declare shortDescription: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  declare price: string; // для DECIMAL лучше string

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare image: string;

  @Column({
    type: DataType.ENUM('men', 'women', 'accessories'),
    allowNull: true, 
  })
  declare category: ProductCategory;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    defaultValue: 1,
  })
  declare available: number;

  @Column({
    field: 'meta_keywords',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare metaKeywords: string;

  @Column({
    field: 'meta_description',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare metaDescription: string;

  @Column({
    field: 'meta_title',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare metaTitle: string;

  @HasMany(() => ProductProperty)
  declare properties: ProductProperty[];

  @HasMany(() => ProductImage)
  declare images: ProductImage[];

  @HasMany(() => ProductReview)
  declare reviews: ProductReview[];
}
