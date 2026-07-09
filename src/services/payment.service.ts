import type Stripe from "stripe";
import prisma from "../config/prisma";
import { stripe } from "../config/stripe";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type { CreatePaymentSessionInput } from "../validations/payment.validation";

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

export async function handleStripeWebhookEvent(
	rawBody: Buffer,
	signature: string,
) {
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			rawBody,
			signature,
			env.stripeWebhookSecret,
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Invalid signature";
		throw new AppError(
			`Webhook signature verification failed: ${message}`,
			400,
		);
	}

	switch (event.type) {
		case "checkout.session.completed": {
			await handleCheckoutSessionCompleted(
				event.data.object as Stripe.Checkout.Session,
			);
			break;
		}
		case "payment_intent.payment_failed": {
			await handlePaymentIntentFailed(
				event.data.object as Stripe.PaymentIntent,
			);
			break;
		}
		default:
			// Unhandled event type — acknowledge and ignore
			break;
	}
}

async function handleCheckoutSessionCompleted(
	session: Stripe.Checkout.Session,
) {
	const bookingId = session.metadata?.bookingId ?? session.client_reference_id;

	if (!bookingId) {
		throw new AppError("Checkout session missing bookingId metadata", 400);
	}

	const payment = await prisma.payment.findUnique({ where: { bookingId } });

	if (!payment) {
		throw new AppError(
			`Payment record not found for booking ${bookingId}`,
			404,
		);
	}

	// Idempotency guard — Stripe may deliver the same event more than once
	if (payment.status === "SUCCEEDED") {
		return;
	}

	const paymentIntentId =
		typeof session.payment_intent === "string" ?
			session.payment_intent
		:	payment.stripePaymentIntentId;

	await prisma.$transaction([
		prisma.payment.update({
			where: { bookingId },
			data: {
				status: "SUCCEEDED",
				paidAt: new Date(),
				...(paymentIntentId !== null && {
					stripePaymentIntentId: paymentIntentId,
				}),
			},
		}),
		prisma.booking.update({
			where: { id: bookingId },
			data: { status: "PAID" },
		}),
	]);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
	const payment = await prisma.payment.findUnique({
		where: { stripePaymentIntentId: paymentIntent.id },
	});

	if (!payment || payment.status === "SUCCEEDED") {
		return;
	}

	await prisma.payment.update({
		where: { id: payment.id },
		data: { status: "FAILED" },
	});
}
