import { Router } from "express";
import {
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getAllTherapistsByPractice,
  getTherapistById,
  getAllInactiveTherapistsByPractice,
} from "../controllers/index.js";
import { requireAuth, practiceContext, validate } from "../middleware/index.js";
import {
  createTherapistSchema,
  updateTherapistSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.post("/create", validate(createTherapistSchema), createTherapist);
router.put("/:therapistId", validate(updateTherapistSchema), updateTherapist);
router.delete("/:therapistId", deleteTherapist);

router.get("/list", getAllTherapistsByPractice);
router.get("/inactive", getAllInactiveTherapistsByPractice);
router.get("/:therapistId", getTherapistById);

export default router;
