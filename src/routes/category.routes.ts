import { Router } from "express";
import {
	createCategory,
	listCategories,
	getCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
	createCategorySchema,
	updateCategorySchema,
} from "../validations/category.validation";

const router = Router();

// Public
router.get("/", listCategories);
router.get("/:id", getCategory);

// Admin-only
router.post(
	"/",
	authenticate,
	authorize("ADMIN"),
	validate(createCategorySchema),
	createCategory,
);
router.patch(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	validate(updateCategorySchema),
	updateCategory,
);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory);

export default router;
