import type Stripe from "stripe";
import prisma from "../config/prisma";
import { stripe } from "../config/stripe";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type {
	CreatePaymentSessionInput,
} from "../validations/payment.validation";

const DEFAULT_CURRENCY = "usd";

function toStripeAmount(amount: number) {
	return Math.round(amount * 100);
}

export async function createPaymentSession(
	customerId: string,
	input: CreatePaymentSessionInput,
) {
	const booking = await prisma.booking.findUnique({
		where: { id: input.bookingId },
		include: { service: true },
	});

	if (!booking) {
		throw new AppError("Booking not found", 404);
	}

	if (booking.customerId !== customerId) {
		throw new AppError("You do not have permission to pay this booking", 403);
	}

	if (booking.status !== "ACCEPTED") {
		throw new AppError("Only accepted bookings can be paid", 400);
	}

	const existingPayment = await prisma.payment.findUnique({
		where: { bookingId: booking.id },
	});

	if (existingPayment?.status === "SUCCEEDED") {
		throw new AppError("This booking is already paid", 409);
	}

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		payment_method_types: ["card"],
		client_reference_id: booking.id,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: DEFAULT_CURRENCY,
					unit_amount: toStripeAmount(booking.price),
					product_data: {
						name: booking.service.title,
						// {commit-14 updated}
						...(booking.service.description !== null && {
							description: booking.service.description,
						}),
						// {commit-14 updated end}
					},
				},
			},
		],
		success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${env.clientUrl}/payment/cancel?bookingId=${booking.id}`,
		metadata: {
			bookingId: booking.id,
			customerId,
		},
		payment_intent_data: {
			metadata: {
				bookingId: booking.id,
				customerId,
			},
		},
	});

	const payment = await prisma.payment.upsert({
		where: { bookingId: booking.id },
		create: {
			bookingId: booking.id,
			customerId,
			amount: booking.price,
			currency: DEFAULT_CURRENCY,
			status: "PENDING",
			stripeCheckoutSessionId: session.id,
			stripePaymentIntentId:
				typeof session.payment_intent === "string" ?
					session.payment_intent
				:	null,
		},
		update: {
			amount: booking.price,
			currency: DEFAULT_CURRENCY,
			status: "PENDING",
			stripeCheckoutSessionId: session.id,
			stripePaymentIntentId:
				typeof session.payment_intent === "string" ?
					session.payment_intent
				:	null,
		},
	});

	return {
		payment,
		checkoutSession: {
			id: session.id,
			url: session.url,
		},
	};
}


