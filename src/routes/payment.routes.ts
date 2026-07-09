import { Router } from "express";
import {
	createPaymentSession,
} from "../controllers/payment.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createPaymentSessionSchema,
} from "../validations/payment.validation";

const router = Router();

router.post(
	"/sessions",
	authenticate,
	authorize("CUSTOMER"),
	validate(createPaymentSessionSchema),
	createPaymentSession,
);


export default router;
