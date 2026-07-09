import type { Response } from "express";

export function sendSuccess<T>(
	res: Response,
	statusCode: number,
	message: string,
	data?: T,
) {
	return res.status(statusCode).json({
		success: true,
		message,
		data: data ?? null,
	});
}

export function sendError(
	res: Response,
	statusCode: number,
	message: string,
	errorDetails: unknown = null,
) {
	return res.status(statusCode).json({
		success: false,
		message,
		errorDetails,
	});
}
