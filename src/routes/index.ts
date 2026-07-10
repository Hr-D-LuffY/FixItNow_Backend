import { Router } from "express";
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import technicianProfileRoutes from "./technicianProfile.routes";
import serviceRoutes from "./service.routes";
import bookingRoutes from "./booking.routes";
import paymentRoutes from "./payment.routes";
import reviewRoutes from "./review.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/technicians", technicianProfileRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;
