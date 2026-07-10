import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as reviewService from "../services/review.service";

export const createReview = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const review = await reviewService.createReview(req.user.userId, req.body);
		return sendSuccess(res, 201, "Review submitted successfully", { review });
	},
);
