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

const bookingStatusValues = [
	"REQUESTED",
	"ACCEPTED",
	"DECLINED",
	"PAID",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
] as const;

export const adminBookingsQuerySchema = z.object({
	status: z.enum(bookingStatusValues).optional(),
	customerId: z.uuid().optional(),
	technicianId: z.uuid().optional(),
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

export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>;
