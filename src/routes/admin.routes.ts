import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
	listUsers,
	getUser,
	banUser,
	unbanUser,
} from "../controllers/admin.controller";
import { browseUsersQuerySchema } from "../validations/admin.validation";

const router = Router();

router.use(authenticate, authorize("ADMIN")); // everything in this router is admin-only

router.get("/users", validate(browseUsersQuerySchema, "query"), listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

export default router;
