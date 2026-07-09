import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type {
	CreateBookingInput,
	BrowseBookingsQuery,
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

type CallerRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export async function browseBookings(
	userId: string,
	role: CallerRole,
	query: BrowseBookingsQuery,
) {
	const { status, page, limit } = query;

	const where: Prisma.BookingWhereInput = {
		...(status !== undefined && { status }),
	};

	if (role === "CUSTOMER") {
		where.customerId = userId;
	} else if (role === "TECHNICIAN") {
		const profile = await getOwnTechnicianProfileOrThrow(userId);
		where.technicianId = profile.id;
	}

	const [bookings, total] = await Promise.all([
		prisma.booking.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				service: true,
				customer: { select: { id: true, name: true, email: true } },
				technician: true,
			},
		}),
		prisma.booking.count({ where }),
	]);

	return {
		bookings,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function getBookingById(
	userId: string,
	role: CallerRole,
	bookingId: string,
) {
	const booking = await prisma.booking.findUnique({
		where: { id: bookingId },
		include: {
			service: true,
			customer: { select: { id: true, name: true, email: true } },
			technician: true,
		},
	});

	if (!booking) {
		throw new AppError("Booking not found", 404);
	}

	if (role === "ADMIN") {
		return booking;
	}

	if (role === "CUSTOMER" && booking.customerId === userId) {
		return booking;
	}

	if (role === "TECHNICIAN") {
		const profile = await getOwnTechnicianProfileOrThrow(userId);
		if (booking.technicianId === profile.id) {
			return booking;
		}
	}

	throw new AppError("You do not have permission to view this booking", 403);
}
