import { Router } from "express";
import {
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getAllSupervisorsByPractice,
  getSupervisorById,
  getAllInactiveSupervisorByPractice,
} from "../controllers/index.js";
import { requireAuth, validate, practiceContext } from "../middleware/index.js";

import {
  createSupervisorSchema,
  updateSupervisorSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", validate(createSupervisorSchema), createSupervisor);
router.put(
  "/:supervisorId",
  validate(updateSupervisorSchema),
  updateSupervisor,
);
router.delete("/:supervisorId", deleteSupervisor);

router.get("/list", getAllSupervisorsByPractice);
router.get("/inactive", getAllInactiveSupervisorByPractice);

router.get("/:supervisorId", getSupervisorById);

export default router;
