import { Router } from "express";
import { createBooking, } from "../controllers/booking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createBookingSchema,
} from "../validations/booking.validation";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), validate(createBookingSchema), createBooking);



export default router;