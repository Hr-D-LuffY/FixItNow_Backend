import { z } from "zod";

export const createTechnicianProfileSchema = z.object({
	bio: z
		.string()
		.trim()
		.min(10, "Bio must be at least 10 characters")
		.optional(),
	experienceYears: z
		.number()
		.int()
		.min(0, "Experience years cannot be negative")
		.optional(),
	skills: z.array(z.string().trim().min(1, "Skill cannot be empty")).optional(),
	availability: z.boolean().optional(),
});

export type CreateTechnicianProfileInput = z.infer<
	typeof createTechnicianProfileSchema
>;

export const updateTechnicianProfileSchema = z
	.object({
		bio: z
			.string()
			.trim()
			.min(10, "Bio must be at least 10 characters")
			.optional(),
		experienceYears: z
			.number()
			.int()
			.min(0, "Experience years cannot be negative")
			.optional(),
		skills: z
			.array(z.string().trim().min(1, "Skill cannot be empty"))
			.optional(),
		availability: z.boolean().optional(),
	})
	.refine(
		(data) =>
			data.bio !== undefined ||
			data.experienceYears !== undefined ||
			data.skills !== undefined ||
			data.availability !== undefined,
		{ message: "At least one field must be provided" },
	);

export type UpdateTechnicianProfileInput = z.infer<
	typeof updateTechnicianProfileSchema
>;
