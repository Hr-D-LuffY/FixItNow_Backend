import { z } from "zod";

export const createPaymentSessionSchema = z.object({
	bookingId: z.uuid("Invalid booking id"),
});

export type CreatePaymentSessionInput = z.infer<
	typeof createPaymentSessionSchema
>;


