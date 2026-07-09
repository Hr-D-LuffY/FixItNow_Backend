import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type {
	CreateBookingInput,
	// BrowseBookingsQuery,
} from "../validations/booking.validation";

async function getOwnTechnicianProfileOrThrow(userId: string) {
	const profile = await prisma.technicianProfile.findUnique({
		where: { userId },
	});

	if (!profile) {
		throw new AppError(
			"Technician profile not found. Please create one first.",
			404,
		);
	}

	return profile;
}

export async function createBooking(
	customerId: string,
	input: CreateBookingInput,
) {
	const service = await prisma.service.findUnique({
		where: { id: input.serviceId },
	});

	if (!service) {
		throw new AppError("Service not found", 404);
	}

	const booking = await prisma.booking.create({
		data: {
			customerId,
			technicianId: service.technicianId,
			serviceId: service.id,
			price: service.price,
			notes: input.notes ?? null,
		},
	});

	return booking;
}
