import { z } from "zod";

export const createBookingSchema = z.object({
	serviceId: z.uuid("Invalid service id"),
	notes: z.string().trim().min(5, "Notes look too short").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
