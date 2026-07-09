import { z } from "zod";

export const createServiceSchema = z.object({
	categoryId: z.uuid("Invalid category id"),
	title: z.string().trim().min(3, "Title must be at least 3 characters"),
	description: z
		.string()
		.trim()
		.min(10, "Description looks too short")
		.optional(),
	price: z.number().positive("Price must be greater than 0"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = z
	.object({
		categoryId: z.uuid("Invalid category id").optional(),
		title: z
			.string()
			.trim()
			.min(3, "Title must be at least 3 characters")
			.optional(),
		description: z
			.string()
			.trim()
			.min(10, "Description looks too short")
			.optional(),
		price: z.number().positive("Price must be greater than 0").optional(),
	})
	.refine(
		(data) =>
			data.categoryId !== undefined ||
			data.title !== undefined ||
			data.description !== undefined ||
			data.price !== undefined,
		{ message: "At least one field must be provided" },
	);

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export const browseServicesQuerySchema = z
	.object({
		categoryId: z.uuid("Invalid category id").optional(),
		search: z.string().trim().min(1, "Search term cannot be empty").optional(),
		minPrice: z.coerce
			.number()
			.min(0, "minPrice cannot be negative")
			.optional(),
		maxPrice: z.coerce
			.number()
			.min(0, "maxPrice cannot be negative")
			.optional(),
		page: z.coerce
			.number()
			.int()
			.min(1, "Page must be at least 1")
			.optional()
			.default(1),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(50, "limit cannot exceed 50")
			.optional()
			.default(20),
	})
	.refine(
		(data) =>
			data.minPrice === undefined ||
			data.maxPrice === undefined ||
			data.minPrice <= data.maxPrice,
		{ message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] },
	);

export type BrowseServicesQuery = z.infer<typeof browseServicesQuerySchema>;
