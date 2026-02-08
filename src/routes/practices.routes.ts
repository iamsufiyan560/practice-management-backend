import { Router } from "express";
import {
  createPractice,
  getAllPractices,
  getPracticeById,
  updatePractice,
  deletePractice,
} from "../controllers/index.js";
import { requireAuth, validate } from "../middleware/index.js";

import {
  createPracticeSchema,
  updatePracticeSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth);

router.post("/create", validate(createPracticeSchema), createPractice);
router.get("/list", getAllPractices);
router.get("/:practiceId", getPracticeById);
router.put("/:practiceId", validate(updatePracticeSchema), updatePractice);
router.delete("/:practiceId", deletePractice);

export default router;
