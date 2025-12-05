import { z } from 'zod';

export const PRODUCT_CATEGORIES = [
  'men',
  'women',
  'accessories',
] as const;

// TS-тип автоматически: 'men' | 'women' | 'accessories'
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

