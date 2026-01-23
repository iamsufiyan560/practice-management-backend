import { Router } from "express";

import ownerRoutes from "./owner.routes";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import practicesRoutes from "./practices.routes";
import adminsRoutes from "./admins.routes";
import supervisorsRoutes from "./supervisors.routes";
import therapistsRoutes from "./therapists.routes";
import patientsRoutes from "./patients.routes";
import assignmentsRoutes from "./assignments.routes";
import sessionsRoutes from "./sessions.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/owner", ownerRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/practices", practicesRoutes);
router.use("/admins", adminsRoutes);
router.use("/supervisors", supervisorsRoutes);
router.use("/therapists", therapistsRoutes);
router.use("/patients", patientsRoutes);
router.use("/assignments", assignmentsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
