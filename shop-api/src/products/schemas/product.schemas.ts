import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../types/product.types';

export const productCategorySchema = z.enum(PRODUCT_CATEGORIES);

export const createProductSchema = z.object({
  manufacturerId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  alias: z.string().min(1).max(255),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  image: z.string().min(1),
  category: productCategorySchema,
  available: z.number().int().optional(),
  metaKeywords: z.string().min(1),
  metaDescription: z.string().min(1),
  metaTitle: z.string().min(1),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
