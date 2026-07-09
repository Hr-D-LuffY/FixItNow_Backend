import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters"),
	email: z.email("Invalid email address").trim().toLowerCase(),
	password: z.string().min(6, "Password must be at least 6 characters"),
	phone: z.string().trim().min(6, "Phone number looks too short").optional(),
	role: z.enum(["CUSTOMER", "TECHNICIAN"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
	email: z.email("Invalid email address").trim().toLowerCase(),
	password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
