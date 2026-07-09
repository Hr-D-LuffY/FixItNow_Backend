export class AppError extends Error {
	statusCode: number;
	errorDetails: unknown;

	constructor(
		message: string,
		statusCode: number,
		errorDetails: unknown = null,
	) {
		super(message);
		this.statusCode = statusCode;
		this.errorDetails = errorDetails;
		this.name = "AppError";
		Error.captureStackTrace(this, this.constructor);
	}
}
