import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";
import { stripe } from "../config/stripe";
import { env } from "../config/env";
import * as paymentService from "../services/payment.service";

export const createPaymentSession = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user) {
			throw new AppError("Authentication required", 401);
		}

		const result = await paymentService.createPaymentSession(
			req.user.userId,
			req.body,
		);

		return sendSuccess(
			res,
			201,
			"Payment session created successfully",
			result,
		);
	},
);

export const handleStripeWebhook = asyncHandler(
	async (req: Request, res: Response) => {
		const signature = req.headers["stripe-signature"];

		if (!signature || typeof signature !== "string") {
			throw new AppError("Missing Stripe signature header", 400);
		}

		await paymentService.handleStripeWebhookEvent(
			req.body as Buffer,
			signature,
		);

		return res.status(200).json({ received: true });
	},
);
