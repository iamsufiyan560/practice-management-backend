import {
  getAdminDashboard,
  getSupervisorDashboard,
  getTherapistDashboard,
} from "../controllers/index.js";
import { Router } from "express";
import { requireAuth, practiceContext } from "../middleware/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.get("/admin", getAdminDashboard);
router.get("/supervisor", getSupervisorDashboard);
router.get("/therapist", getTherapistDashboard);

export default router;
