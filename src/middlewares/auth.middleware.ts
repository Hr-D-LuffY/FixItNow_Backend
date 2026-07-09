import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/response";
import type { Role } from "../generated/prisma/client";

export function authenticate(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return sendError(res, 401, "Authentication token is missing");
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return sendError(res, 401, "Authentication token is missing");
	}

	try {
		const decoded: JwtPayload = verifyToken(token);
		req.user = decoded;
		return next();
	} catch (error) {
		return sendError(res, 401, "Invalid or expired token");
	}
}

export function authorize(...allowedRoles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return sendError(res, 401, "Authentication required");
		}

		if (!allowedRoles.includes(req.user.role)) {
			return sendError(
				res,
				403,
				"You do not have permission to perform this action",
			);
		}

		return next();
	};
}
