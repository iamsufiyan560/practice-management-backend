import { Router } from "express";

import ownerRoutes from "./owner.routes.js";
import authRoutes from "./auth.routes.js";
import practicesRoutes from "./practices.routes.js";
import adminsRoutes from "./admins.routes.js";
import supervisorsRoutes from "./supervisors.routes.js";
import therapistsRoutes from "./therapists.routes.js";
import patientsRoutes from "./patients.routes.js";
import assignmentsRoutes from "./assignments.routes.js";
import sessionsRoutes from "./sessions.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.use("/owner", ownerRoutes);
router.use("/auth", authRoutes);
router.use("/practices", practicesRoutes);
router.use("/admins", adminsRoutes);
router.use("/supervisors", supervisorsRoutes);
router.use("/therapists", therapistsRoutes);
router.use("/patients", patientsRoutes);
router.use("/assignments", assignmentsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
