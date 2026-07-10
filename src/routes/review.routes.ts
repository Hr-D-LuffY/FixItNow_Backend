import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createReview } from "../controllers/review.controller";
import { createReviewSchema } from "../validations/review.validation";

const router = Router();

router.post(
	"/",
	authenticate,
	authorize("CUSTOMER"),
	validate(createReviewSchema),
	createReview,
);

export default router;
