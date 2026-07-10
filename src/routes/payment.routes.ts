import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";

import { authenticate, authorize } from "../middlewares/auth.middleware";

import {
	createPaymentSession,
	listPayments,
	getPayment,
} from "../controllers/payment.controller";

import {
	createPaymentSessionSchema,
	browsePaymentsQuerySchema,
} from "../validations/payment.validation";

const router = Router();

router.post(
	"/sessions",
	authenticate,
	authorize("CUSTOMER"),
	validate(createPaymentSessionSchema),
	createPaymentSession,
);

router.get(
	"/",
	authenticate,
	validate(browsePaymentsQuerySchema, "query"),
	listPayments,
);
router.get("/:id", authenticate, getPayment);

export default router;
