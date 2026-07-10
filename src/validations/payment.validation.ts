import { z } from "zod";

export const createPaymentSessionSchema = z.object({
	bookingId: z.uuid("Invalid booking id"),
});

export type CreatePaymentSessionInput = z.infer<
	typeof createPaymentSessionSchema
>;

const paymentStatusValues = ["PENDING", "SUCCEEDED", "FAILED"] as const;

export const browsePaymentsQuerySchema = z.object({
	status: z.enum(paymentStatusValues).optional(),
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

export type BrowsePaymentsQuery = z.infer<typeof browsePaymentsQuerySchema>;
