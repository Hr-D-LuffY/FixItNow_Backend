import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as bookingService from "../services/booking.service";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const booking = await bookingService.createBooking(req.user.userId, req.body);
	return sendSuccess(res, 201, "Booking created successfully", { booking });
});

