import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import * as bookingService from "../services/booking.service";
import type { BrowseBookingsQuery } from "../validations/booking.validation";

export const createBooking = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const booking = await bookingService.createBooking(
			req.user.userId,
			req.body,
		);
		return sendSuccess(res, 201, "Booking created successfully", { booking });
	},
);

export const listBookings = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}
		const result = await bookingService.browseBookings(
			req.user.userId,
			req.user.role,
			req.validatedQuery as unknown as BrowseBookingsQuery,
		);
		return sendSuccess(res, 200, "Bookings fetched successfully", result);
	},
);

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401);
	}
	const booking = await bookingService.getBookingById(
		req.user.userId,
		req.user.role,
		req.params.id as string,
	);
	return sendSuccess(res, 200, "Booking fetched successfully", { booking });
});
