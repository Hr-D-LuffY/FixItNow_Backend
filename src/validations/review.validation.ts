import { z } from "zod";

export const createReviewSchema = z.object({
	bookingId: z.uuid("Invalid booking id"),
	rating: z
		.number()
		.int("Rating must be a whole number")
		.min(1, "Rating must be at least 1")
		.max(5, "Rating cannot exceed 5"),
	comment: z.string().trim().min(1).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
