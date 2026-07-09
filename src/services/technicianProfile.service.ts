import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type {
	CreateTechnicianProfileInput,
	UpdateTechnicianProfileInput,
} from "../validations/technicianProfile.validation";

export async function createTechnicianProfile(
	userId: string,
	input: CreateTechnicianProfileInput,
) {
	const existing = await prisma.technicianProfile.findUnique({
		where: { userId },
	});

	if (existing) {
		throw new AppError(
			"Technician profile already exists. Use update instead.",
			409,
		);
	}

	const profile = await prisma.technicianProfile.create({
		data: {
			userId,
			bio: input.bio ?? null,
			experienceYears: input.experienceYears ?? null,
			skills: input.skills ?? [],
			availability: input.availability ?? true,
		},
	});

	return profile;
}

export async function getOwnTechnicianProfile(userId: string) {
	const profile = await prisma.technicianProfile.findUnique({
		where: { userId },
	});

	if (!profile) {
		throw new AppError(
			"Technician profile not found. Please create one first.",
			404,
		);
	}

	return profile;
}

export async function updateTechnicianProfile(
	userId: string,
	input: UpdateTechnicianProfileInput,
) {
	const existing = await prisma.technicianProfile.findUnique({
		where: { userId },
	});

	if (!existing) {
		throw new AppError(
			"Technician profile not found. Please create one first.",
			404,
		);
	}

	const profile = await prisma.technicianProfile.update({
		where: { userId },
		data: {
			...(input.bio !== undefined && { bio: input.bio ?? null }),
			...(input.experienceYears !== undefined && {
				experienceYears: input.experienceYears,
			}),
			...(input.skills !== undefined && { skills: input.skills }),
			...(input.availability !== undefined && {
				availability: input.availability,
			}),
		},
	});

	return profile;
}
