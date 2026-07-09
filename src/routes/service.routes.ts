import { Router } from "express";
import {
	createService,
	listServices,
	getService,
	updateService,
	deleteService,
} from "../controllers/service.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createServiceSchema,
	updateServiceSchema,
	browseServicesQuerySchema,
} from "../validations/service.validation";

const router = Router();

// Public
router.get("/", validate(browseServicesQuerySchema, "query"), listServices);
router.get("/:id", getService);

// Technician-only
router.post(
	"/",
	authenticate,
	authorize("TECHNICIAN"),
	validate(createServiceSchema),
	createService,
);
router.patch(
	"/:id",
	authenticate,
	authorize("TECHNICIAN"),
	validate(updateServiceSchema),
	updateService,
);
router.delete("/:id", authenticate, authorize("TECHNICIAN"), deleteService);

export default router;
