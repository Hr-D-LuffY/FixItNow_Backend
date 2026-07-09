import { z } from "zod";

export const createBookingSchema = z.object({
	serviceId: z.uuid("Invalid service id"),
	notes: z.string().trim().min(5, "Notes look too short").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

const bookingStatusValues = [
	"REQUESTED",
	"ACCEPTED",
	"DECLINED",
	"PAID",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
] as const;

export const browseBookingsQuerySchema = z.object({
	status: z.enum(bookingStatusValues).optional(),
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

export type BrowseBookingsQuery = z.infer<typeof browseBookingsQuerySchema>;

export const updateBookingStatusSchema = z.object({
	status: z.enum(
		["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"],
		"Invalid status",
	),
});

export type UpdateBookingStatusInput = z.infer<
	typeof updateBookingStatusSchema
>;
