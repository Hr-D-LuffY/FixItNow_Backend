import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(fn: RequestHandler): RequestHandler {
	return function (req: Request, res: Response, next: NextFunction) {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
