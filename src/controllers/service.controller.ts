import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as serviceService from "../services/service.service";
import type { BrowseServicesQuery } from "../validations/service.validation";

export const createService = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const service = await serviceService.createService(
			req.user.userId,
			req.body,
		);
		return sendSuccess(res, 201, "Service created successfully", { service });
	},
);

export const listServices = asyncHandler(
	async (req: Request, res: Response) => {
		const result = await serviceService.browseServices(
			req.validatedQuery as unknown as BrowseServicesQuery,
		);
		return sendSuccess(res, 200, "Services fetched successfully", result);
	},
);

export const getService = asyncHandler(async (req: Request, res: Response) => {
	const service = await serviceService.getServiceById(req.params.id as string);
	return sendSuccess(res, 200, "Service fetched successfully", { service });
});

export const updateService = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const service = await serviceService.updateService(
			req.user.userId,
			req.params.id as string,
			req.body,
		);
		return sendSuccess(res, 200, "Service updated successfully", { service });
	},
);

export const deleteService = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		await serviceService.deleteService(
			req.user.userId,
			req.params.id as string,
		);
		return sendSuccess(res, 200, "Service deleted successfully");
	},
);
