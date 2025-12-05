import { z } from 'zod';

export const createReviewSchema = z.object({
  authorName: z.string().min(1).max(255),

  authorFirstName: z.string().min(1).max(255).optional(),
  authorLastName: z.string().min(1).max(255).optional(),
  authorGender: z.enum(['male', 'female']).optional(),

  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
