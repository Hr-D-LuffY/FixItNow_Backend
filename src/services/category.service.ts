import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "../validations/category.validation";

export async function createCategory(input: CreateCategoryInput) {
	const category = await prisma.category.create({
		data: {
			name: input.name,
			description: input.description ?? null,
		},
	});

	return category;
}

export async function getAllCategories() {
	return prisma.category.findMany({
		orderBy: { name: "asc" },
	});
}

export async function getCategoryById(id: string) {
	const category = await prisma.category.findUnique({ where: { id } });

	if (!category) {
		throw new AppError("Category not found", 404);
	}

	return category;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
	const existing = await prisma.category.findUnique({ where: { id } });

	if (!existing) {
		throw new AppError("Category not found", 404);
	}

	const category = await prisma.category.update({
		where: { id },
		data: {
			...(input.name !== undefined && { name: input.name }),
			...(input.description !== undefined && {
				description: input.description ?? null,
			}),
		},
	});

	return category;
}

export async function deleteCategory(id: string) {
	const existing = await prisma.category.findUnique({ where: { id } });

	if (!existing) {
		throw new AppError("Category not found", 404);
	}

	await prisma.category.delete({ where: { id } });
}
