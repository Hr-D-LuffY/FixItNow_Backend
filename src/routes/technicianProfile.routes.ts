import { Router } from "express";
import {
	createProfile,
	getProfile,
	updateProfile,
} from "../controllers/technicianProfile.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createTechnicianProfileSchema,
	updateTechnicianProfileSchema,
} from "../validations/technicianProfile.validation";

const router = Router();

router.post(
	"/profile",
	authenticate,
	authorize("TECHNICIAN"),
	validate(createTechnicianProfileSchema),
	createProfile,
);

router.get("/profile", authenticate, authorize("TECHNICIAN"), getProfile);

router.patch(
	"/profile",
	authenticate,
	authorize("TECHNICIAN"),
	validate(updateTechnicianProfileSchema),
	updateProfile,
);

export default router;
