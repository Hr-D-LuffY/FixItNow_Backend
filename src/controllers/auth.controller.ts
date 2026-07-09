import type { Request, Response } from "express";
import {
	registerUser,
	loginUser,
	getUserProfile,
} from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const register = asyncHandler(async (req: Request, res: Response) => {
	const result = await registerUser(req.body);
	return sendSuccess(res, 201, "User registered successfully", result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const result = await loginUser(req.body);
	return sendSuccess(res, 200, "Login successful", result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const user = await getUserProfile(req.user.userId);
	return sendSuccess(res, 200, "User profile fetched successfully", { user });
});
