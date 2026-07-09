import { Router } from "express";
import prisma from "../config/prisma";
import authRoutes from "./auth.routes";
import { sendSuccess, sendError } from "../utils/response";

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

export default router;
