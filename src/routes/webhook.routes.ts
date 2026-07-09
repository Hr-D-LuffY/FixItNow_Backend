import { Router } from "express";
import express from "express";
import { handleStripeWebhook } from "../controllers/payment.controller";

// {commit-15}
const router = Router();

router.post(
	"/stripe",
	express.raw({ type: "application/json" }),
	handleStripeWebhook,
);

export default router;
// {commit-15 end}