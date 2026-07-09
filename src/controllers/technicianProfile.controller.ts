import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as technicianProfileService from "../services/technicianProfile.service";

export const createProfile = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const profile = await technicianProfileService.createTechnicianProfile(
			req.user.userId,
			req.body,
		);
		return sendSuccess(res, 201, "Technician profile created successfully", {
			profile,
		});
	},
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const profile = await technicianProfileService.getOwnTechnicianProfile(
		req.user.userId,
	);
	return sendSuccess(res, 200, "Technician profile fetched successfully", {
		profile,
	});
});

export const updateProfile = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const profile = await technicianProfileService.updateTechnicianProfile(
			req.user.userId,
			req.body,
		);
		return sendSuccess(res, 200, "Technician profile updated successfully", {
			profile,
		});
	},
);
