import { Router } from "express";
import {
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getAllTherapistsByPractice,
  getTherapistById,
  getAllInactiveTherapistsByPractice,
} from "../controllers/index.js";
import { requireAuth, practiceContext } from "../middleware/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", createTherapist);
router.put("/:therapistId", updateTherapist);
router.delete("/:therapistId", deleteTherapist);

router.get("/list", getAllTherapistsByPractice);
router.get("/inactive", getAllInactiveTherapistsByPractice);
router.get("/:therapistId", getTherapistById);

export default router;
