import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { Prisma, BookingStatus } from "../generated/prisma/client";
import type {
	CreateBookingInput,
	BrowseBookingsQuery,
	UpdateBookingStatusInput,
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

const TECHNICIAN_ALLOWED_TRANSITIONS: Partial<
	Record<BookingStatus, BookingStatus[]>
> = {
	REQUESTED: ["ACCEPTED", "DECLINED"],
	PAID: ["IN_PROGRESS"],
	IN_PROGRESS: ["COMPLETED"],
};

export async function updateBookingStatus(
	userId: string,
	bookingId: string,
	input: UpdateBookingStatusInput,
) {
	const profile = await getOwnTechnicianProfileOrThrow(userId);

	const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
	if (!booking) {
		throw new AppError("Booking not found", 404);
	}

	if (booking.technicianId !== profile.id) {
		throw new AppError(
			"You do not have permission to update this booking",
			403,
		);
	}

	const allowedNextStatuses =
		TECHNICIAN_ALLOWED_TRANSITIONS[booking.status] ?? [];
	if (!allowedNextStatuses.includes(input.status)) {
		throw new AppError(
			`Cannot change booking status from ${booking.status} to ${input.status}`,
			400,
		);
	}

	const updated = await prisma.booking.update({
		where: { id: bookingId },
		data: { status: input.status },
	});

	return updated;
}
