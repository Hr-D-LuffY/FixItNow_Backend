import { Router } from "express";
import {
	createBooking,
	listBookings,
	getBooking,
	updateBookingStatus,
	cancelBooking,
} from "../controllers/booking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createBookingSchema,
	browseBookingsQuerySchema,
	updateBookingStatusSchema,
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

router.patch(
	"/:id/status",
	authenticate,
	authorize("TECHNICIAN"),
	validate(updateBookingStatusSchema),
	updateBookingStatus,
);

router.patch("/:id/cancel", authenticate, authorize("CUSTOMER"), cancelBooking);

export default router;
