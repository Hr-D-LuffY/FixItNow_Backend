import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { CreateReviewInput } from "../validations/review.validation";

export async function createReview(
	customerId: string,
	input: CreateReviewInput,
) {
	const booking = await prisma.booking.findUnique({
		where: { id: input.bookingId },
	});

	if (!booking) {
		throw new AppError("Booking not found", 404);
	}

	if (booking.customerId !== customerId) {
		throw new AppError(
			"You do not have permission to review this booking",
			403,
		);
	}

	if (booking.status !== "COMPLETED") {
		throw new AppError("Only completed bookings can be reviewed", 400);
	}

	const existingReview = await prisma.review.findUnique({
		where: { bookingId: booking.id },
	});

	if (existingReview) {
		throw new AppError("You have already reviewed this booking", 409);
	}

	const review = await prisma.review.create({
		data: {
			bookingId: booking.id,
			customerId,
			technicianId: booking.technicianId,
			rating: input.rating,
			comment: input.comment ?? null,
		},
	});

	return review;
}
