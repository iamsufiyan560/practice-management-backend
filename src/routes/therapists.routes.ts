import { Router } from "express";
import {
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getAllTherapistsByPractice,
  getTherapistById,
} from "../controllers/index.js";

const router = Router();

router.post("/create", createTherapist);
router.put("/:therapistId", updateTherapist);
router.delete("/:therapistId", deleteTherapist);

router.get("/list", getAllTherapistsByPractice);
router.get("/:therapistId", getTherapistById);

export default router;
