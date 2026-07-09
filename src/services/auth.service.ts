import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { signToken } from "../utils/jwt";
import type { RegisterInput, LoginInput } from "../validations/auth.validation";

const SALT_ROUNDS = 10;

export class AuthServiceError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.name = "AuthServiceError";
	}
}

export async function registerUser(input: RegisterInput) {
	const existingUser = await prisma.user.findUnique({
		where: { email: input.email },
	});

	if (existingUser) {
		throw new AuthServiceError(
			"An account with this email already exists",
			409,
		);
	}

	const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			password: hashedPassword,
			phone: input.phone ?? null,
			role: input.role,
		},
	});
	const token = signToken({ userId: user.id, role: user.role });

	return {
		token,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			status: user.status,
		},
	};
}

export async function loginUser(input: LoginInput) {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
	});

	if (!user) {
		throw new AuthServiceError("Invalid email or password", 401);
	}

	if (user.status === "BANNED") {
		throw new AuthServiceError(
			"This account has been banned. Contact support.",
			403,
		);
	}

	const isPasswordValid = await bcrypt.compare(input.password, user.password);

	if (!isPasswordValid) {
		throw new AuthServiceError("Invalid email or password", 401);
	}

	const token = signToken({ userId: user.id, role: user.role });

	return {
		token,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			status: user.status,
		},
	};
}
