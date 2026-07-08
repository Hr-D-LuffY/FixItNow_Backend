import { Router } from "express";

const router = Router();

router.get("/hlw", (req, res) => {
	res.status(200).json({
		success: true,
		message: "FixItNow API is running successfully!!!",
		errorDetails: null,
	});
});

export default router;
