import { Router } from "express";
import {
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getAllSupervisorsByPractice,
  getSupervisorById,
} from "@/controllers";

const router = Router();

router.post("/create", createSupervisor);
router.put("/:supervisorId", updateSupervisor);
router.delete("/:supervisorId", deleteSupervisor);

router.get("/list", getAllSupervisorsByPractice);
router.get("/:supervisorId", getSupervisorById);

export default router;
