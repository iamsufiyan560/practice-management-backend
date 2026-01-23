import {
  getAdminDashboard,
  getSupervisorDashboard,
  getTherapistDashboard,
} from "@/controllers";
import { Router } from "express";

const router = Router();

router.get("/admin", getAdminDashboard);
router.get("/supervisor/:supervisorId", getSupervisorDashboard);
router.get("/therapist/:therapistId", getTherapistDashboard);

export default router;
