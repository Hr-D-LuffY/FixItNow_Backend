import { Router } from "express";
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import technicianProfileRoutes from "./technicianProfile.routes";
import serviceRoutes from "./service.routes";
import bookingRoutes from "./booking.routes";

const router = Router();

router.get("/hlw", async (req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return sendSuccess(
			res,
			200,
			"FixItNow API is running and connected to database",
		);
	} catch (error) {
		console.error("Health check DB error:", error);
		return sendError(res, 500, "database connection failed");
	}
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/technicians", technicianProfileRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);

export default router;
