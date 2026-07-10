import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type {
	BrowseUsersQuery,
	AdminBookingsQuery,
} from "../validations/admin.validation";

export async function browseUsers(query: BrowseUsersQuery) {
	const { role, status, search, page, limit } = query;

	const where: Prisma.UserWhereInput = {
		...(role !== undefined && { role }),
		...(status !== undefined && { status }),
		...(search !== undefined && {
			OR: [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			],
		}),
	};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				status: true,
				createdAt: true,
				// password intentionally excluded
			},
		}),
		prisma.user.count({ where }),
	]);

	return {
		users,
		pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
	};
}

export async function getUserById(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			role: true,
			status: true,
			createdAt: true,
		},
	});

	if (!user) {
		throw new AppError("User not found", 404);
	}

	return user;
}

async function setUserStatus(
	adminUserId: string,
	targetUserId: string,
	status: "ACTIVE" | "BANNED",
) {
	if (adminUserId === targetUserId) {
		throw new AppError("You cannot change your own account status", 400);
	}

	const target = await prisma.user.findUnique({ where: { id: targetUserId } });
	if (!target) {
		throw new AppError("User not found", 404);
	}

	if (target.role === "ADMIN") {
		throw new AppError("Admin accounts cannot be banned or unbanned", 400);
	}

	if (target.status === status) {
		throw new AppError(`User is already ${status.toLowerCase()}`, 409);
	}

	return prisma.user.update({
		where: { id: targetUserId },
		data: { status },
		select: { id: true, name: true, email: true, role: true, status: true },
	});
}

export function banUser(adminUserId: string, targetUserId: string) {
	return setUserStatus(adminUserId, targetUserId, "BANNED");
}

export function unbanUser(adminUserId: string, targetUserId: string) {
	return setUserStatus(adminUserId, targetUserId, "ACTIVE");
}

export async function browseAllBookings(query: AdminBookingsQuery) {
	const { status, customerId, technicianId, page, limit } = query;

	const where: Prisma.BookingWhereInput = {
		...(status !== undefined && { status }),
		...(customerId !== undefined && { customerId }),
		...(technicianId !== undefined && { technicianId }),
	};

	const [bookings, total] = await Promise.all([
		prisma.booking.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				customer: { select: { id: true, name: true, email: true } },
				technician: {
					include: { user: { select: { id: true, name: true, email: true } } },
				},
				service: true,
				payment: true,
			},
		}),
		prisma.booking.count({ where }),
	]);

	return {
		bookings,
		pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
	};
}

export async function getBookingStats() {
	const grouped = await prisma.booking.groupBy({
		by: ["status"],
		_count: { _all: true },
	});

	const byStatus = Object.fromEntries(
		grouped.map((g) => [g.status, g._count._all]),
	);
	const totalBookings = grouped.reduce((sum, g) => sum + g._count._all, 0);

	const revenue = await prisma.payment.aggregate({
		where: { status: "SUCCEEDED" },
		_sum: { amount: true },
	});

	return {
		totalBookings,
		byStatus,
		totalRevenue: revenue._sum.amount ?? 0,
	};
}
