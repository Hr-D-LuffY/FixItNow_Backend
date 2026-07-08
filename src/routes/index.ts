import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/hlw", async (req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.status(200).json({
			success: true,
			message:
				"FixItNow API is running and connected to database successfully!!!",
			errorDetails: null,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Database connection failed",
			errorDetails: error instanceof Error ? error.message : String(error),
		});
	}
});

export default router;
