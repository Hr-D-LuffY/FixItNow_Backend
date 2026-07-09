import type { Request, Response } from "express";
import { sendError } from "../utils/response";

export function notFound(req: Request, res: Response) {
	return sendError(
		res,
		404,
		`Route not found: ${req.method} ${req.originalUrl}`,
	);
}
