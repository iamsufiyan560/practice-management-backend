import { Router } from "express";
import {
  createPractice,
  getAllPractices,
  getPracticeById,
  updatePractice,
  deletePractice,
} from "../controllers/index.js";

const router = Router();

router.post("/create", createPractice);
router.get("/list", getAllPractices);
router.get("/:practiceId", getPracticeById);
router.put("/:practiceId", updatePractice);
router.delete("/:practiceId", deletePractice);

export default router;
