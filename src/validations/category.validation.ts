import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters"),
	description: z
		.string()
		.trim()
		.min(2, "Description looks too short")
		.optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, "Name must be at least 2 characters")
			.optional(),
		description: z
			.string()
			.trim()
			.min(2, "Description looks too short")
			.optional(),
	})
	.refine((data) => data.name !== undefined || data.description !== undefined, {
		message: "At least one field (name or description) must be provided",
	});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
