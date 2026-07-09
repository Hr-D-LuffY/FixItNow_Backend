import { Router } from "express";
import {
	createBooking,
	listBookings,
	getBooking,
} from "../controllers/booking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createBookingSchema,
	browseBookingsQuerySchema,
} from "../validations/booking.validation";

const router = Router();

router.post(
	"/",
	authenticate,
	authorize("CUSTOMER"),
	validate(createBookingSchema),
	createBooking,
);
router.get(
	"/",
	authenticate,
	validate(browseBookingsQuerySchema, "query"),
	listBookings,
);
router.get("/:id", authenticate, getBooking);

export default router;
