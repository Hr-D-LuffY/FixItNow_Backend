import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	// Zod validation errors (from validate.middleware.ts)
	if (err instanceof ZodError) {
		return sendError(
			res,
			400,
			"Validation failed",
			z.flattenError(err).fieldErrors,
		);
	}

	// Known application/business-logic errors
	if (err instanceof AppError) {
		return sendError(res, err.statusCode, err.message, err.errorDetails);
	}

	// Known Prisma errors (duplicate unique field, record not found, etc.)
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			return sendError(res, 409, "A record with this value already exists", {
				fields: err.meta?.target ?? null,
			});
		}
		if (err.code === "P2025") {
			return sendError(res, 404, "Record not found");
		}
		return sendError(res, 400, "Database request error");
	}

	// Fallback: anything unexpected
	console.error("Unhandled error:", err);
	return sendError(
		res,
		500,
		"Something went wrong. Please try again later",
		env.nodeEnv === "development" && err instanceof Error ? err.message : null,
	);
}
