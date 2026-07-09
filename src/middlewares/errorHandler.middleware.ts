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
		const flattened = z.flattenError(err);
		const errorDetails =
			flattened.formErrors.length > 0 ?
				{ formErrors: flattened.formErrors, fieldErrors: flattened.fieldErrors }
			:	flattened.fieldErrors;
		return sendError(res, 400, "Validation failed", errorDetails);
	}

	// Known application/business-logic errors
	if (err instanceof AppError) {
		return sendError(res, err.statusCode, err.message, err.errorDetails);
	}

	// Known Prisma errors (duplicate unique field, record not found, etc.)
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			if (env.nodeEnv === "development") {
				console.error("P2002 meta (raw):", err.meta);
			}
			const target = err.meta?.target;
			const fields =
				Array.isArray(target) ? target
				: typeof target === "string" ? [target]
				: null;
			return sendError(res, 409, "A record with this value already exists", {
				fields,
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
