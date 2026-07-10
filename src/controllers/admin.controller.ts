import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as adminService from "../services/admin.service";
import type { BrowseUsersQuery } from "../validations/admin.validation";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
	const result = await adminService.browseUsers(
		req.validatedQuery as unknown as BrowseUsersQuery,
	);
	return sendSuccess(res, 200, "Users fetched successfully", result);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
	const user = await adminService.getUserById(req.params.id as string);
	return sendSuccess(res, 200, "User fetched successfully", { user });
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const user = await adminService.banUser(
		req.user.userId,
		req.params.id as string,
	);
	return sendSuccess(res, 200, "User banned successfully", { user });
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const user = await adminService.unbanUser(
		req.user.userId,
		req.params.id as string,
	);
	return sendSuccess(res, 200, "User unbanned successfully", { user });
});
