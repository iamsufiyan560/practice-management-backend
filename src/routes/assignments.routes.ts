// routes
import { Router } from "express";
import {
  assignTherapistToSupervisor,
  assignPatientToTherapist,
} from "../controllers/index.js";
import { requireAuth, validate, practiceContext } from "../middleware/index.js";
import {
  assignTherapistToSupervisorSchema,
  assignPatientToTherapistSchema,
} from "../validations/index.js";

const router = Router();

router.use(requireAuth, practiceContext);

router.put(
  "/therapist-to-supervisor",
  validate(assignTherapistToSupervisorSchema),
  assignTherapistToSupervisor,
);
router.put(
  "/patient-to-therapist",
  validate(assignPatientToTherapistSchema),
  assignPatientToTherapist,
);

export default router;
