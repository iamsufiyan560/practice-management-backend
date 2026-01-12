import { Router } from "express";
import {
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getAllSupervisorsByPractice,
  getSupervisorById,
  getAllInactiveSupervisorByPractice,
} from "../controllers/index.js";
import { requireAuth, practiceContext } from "../middleware/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", createSupervisor);
router.put("/:supervisorId", updateSupervisor);
router.delete("/:supervisorId", deleteSupervisor);

router.get("/list", getAllSupervisorsByPractice);
router.get("/inactive", getAllInactiveSupervisorByPractice);

router.get("/:supervisorId", getSupervisorById);

export default router;
