import type { Request, Response } from "express";
import { z, ZodError } from "zod";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import {
	registerUser,
	loginUser,
	AuthServiceError,
} from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export async function register(req: Request, res: Response) {
	try {
		const parsed = registerSchema.parse(req.body);
		const result = await registerUser(parsed);
		return sendSuccess(res, 201, "User registered successfully", result);
	} catch (error) {
		if (error instanceof ZodError) {
			return sendError(
				res,
				400,
				"Validation failed",
				z.flattenError(error).fieldErrors,
			);
		}
		if (error instanceof AuthServiceError) {
			return sendError(res, error.statusCode, error.message);
		}
		console.error("Register error:", error);
		return sendError(res, 500, "Something went wrong while registering");
	}
}

export async function login(req: Request, res: Response) {
	try {
		const parsed = loginSchema.parse(req.body);
		const result = await loginUser(parsed);
		return sendSuccess(res, 200, "Login successful", result);
	} catch (error) {
		if (error instanceof ZodError) {
			return sendError(
				res,
				400,
				"Validation failed",
				z.flattenError(error).fieldErrors,
			);
		}
		if (error instanceof AuthServiceError) {
			return sendError(res, error.statusCode, error.message);
		}
		console.error("Login error:", error);
		return sendError(res, 500, "Something went wrong while logging in");
	}
}
