import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type {
	CreateServiceInput,
	UpdateServiceInput,
	BrowseServicesQuery,
} from "../validations/service.validation";

async function getOwnTechnicianProfileOrThrow(userId: string) {
	const profile = await prisma.technicianProfile.findUnique({
		where: { userId },
	});

	if (!profile) {
		throw new AppError(
			"Please create your technician profile before adding services",
			404,
		);
	}

	return profile;
}

export async function createService(userId: string, input: CreateServiceInput) {
	const profile = await getOwnTechnicianProfileOrThrow(userId);

	const category = await prisma.category.findUnique({
		where: { id: input.categoryId },
	});
	if (!category) {
		throw new AppError("Category not found", 404);
	}

	const service = await prisma.service.create({
		data: {
			technicianId: profile.id,
			categoryId: input.categoryId,
			title: input.title,
			description: input.description ?? null,
			price: input.price,
		},
	});

	return service;
}

export async function browseServices(query: BrowseServicesQuery) {
	const { categoryId, search, minPrice, maxPrice, page, limit } = query;

	const where: Prisma.ServiceWhereInput = {
		...(categoryId !== undefined && { categoryId }),
		...(search !== undefined && {
			title: { contains: search, mode: "insensitive" },
		}),
		...((minPrice !== undefined || maxPrice !== undefined) && {
			price: {
				...(minPrice !== undefined && { gte: minPrice }),
				...(maxPrice !== undefined && { lte: maxPrice }),
			},
		}),
	};

	const [services, total] = await Promise.all([
		prisma.service.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: { category: true, technician: true },
		}),
		prisma.service.count({ where }),
	]);

	return {
		services,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function getServiceById(id: string) {
	const service = await prisma.service.findUnique({
		where: { id },
		include: { category: true, technician: true },
	});

	if (!service) {
		throw new AppError("Service not found", 404);
	}

	return service;
}

export async function updateService(
	userId: string,
	serviceId: string,
	input: UpdateServiceInput,
) {
	const profile = await getOwnTechnicianProfileOrThrow(userId);

	const existing = await prisma.service.findUnique({
		where: { id: serviceId },
	});
	if (!existing) {
		throw new AppError("Service not found", 404);
	}

	if (existing.technicianId !== profile.id) {
		throw new AppError(
			"You do not have permission to modify this service",
			403,
		);
	}

	if (input.categoryId !== undefined) {
		const category = await prisma.category.findUnique({
			where: { id: input.categoryId },
		});
		if (!category) {
			throw new AppError("Category not found", 404);
		}
	}

	const service = await prisma.service.update({
		where: { id: serviceId },
		data: {
			...(input.title !== undefined && { title: input.title }),
			...(input.description !== undefined && {
				description: input.description ?? null,
			}),
			...(input.price !== undefined && { price: input.price }),
			...(input.categoryId !== undefined && { categoryId: input.categoryId }),
		},
	});

	return service;
}

export async function deleteService(userId: string, serviceId: string) {
	const profile = await getOwnTechnicianProfileOrThrow(userId);

	const existing = await prisma.service.findUnique({
		where: { id: serviceId },
	});
	if (!existing) {
		throw new AppError("Service not found", 404);
	}

	if (existing.technicianId !== profile.id) {
		throw new AppError(
			"You do not have permission to delete this service",
			403,
		);
	}

	await prisma.service.delete({ where: { id: serviceId } });
}
