import { z } from "zod";

const roleValues = ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const;
const statusValues = ["ACTIVE", "BANNED"] as const;

export const browseUsersQuerySchema = z.object({
	role: z.enum(roleValues).optional(),
	status: z.enum(statusValues).optional(),
	search: z.string().trim().min(1).optional(), // matches against name/email
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
});

export type BrowseUsersQuery = z.infer<typeof browseUsersQuerySchema>;
