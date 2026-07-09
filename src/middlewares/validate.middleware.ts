import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type ValidationTarget = "body" | "query";

export function validate(schema: ZodType, target: ValidationTarget = "body") {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const parsed = schema.parse(req[target]);
			if (target === "query") {
				// req.query is a read-only getter that re-parses on every access in
				// recent Express versions — it is NOT a cached, mutable property.
				// Object.assign(req.query, parsed) silently does nothing useful because
				// the very next req.query read returns a fresh, unmutated object.
				// Store the validated/coerced/defaulted result separately instead.
				req.validatedQuery = parsed as Record<string, unknown>;
			} else {
				req.body = parsed;
			}
			next();
		} catch (error) {
			next(error);
		}
	};
}
