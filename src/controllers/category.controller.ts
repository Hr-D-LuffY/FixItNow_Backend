import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import * as categoryService from "../services/category.service";

export const createCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const category = await categoryService.createCategory(req.body);
		return sendSuccess(res, 201, "Category created successfully", { category });
	},
);

export const listCategories = asyncHandler(
	async (_req: Request, res: Response) => {
		const categories = await categoryService.getAllCategories();
		return sendSuccess(res, 200, "Categories fetched successfully", {
			categories,
		});
	},
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
	const category = await categoryService.getCategoryById(
		req.params.id as string,
	);
	return sendSuccess(res, 200, "Category fetched successfully", { category });
});

export const updateCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const category = await categoryService.updateCategory(
			req.params.id as string,
			req.body,
		);
		return sendSuccess(res, 200, "Category updated successfully", { category });
	},
);

export const deleteCategory = asyncHandler(
	async (req: Request, res: Response) => {
		await categoryService.deleteCategory(req.params.id as string);
		return sendSuccess(res, 200, "Category deleted successfully");
	},
);
