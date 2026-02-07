import { Router } from "express";
import {
  assignTherapistToSupervisor,
  assignPatientToTherapist,
} from "../controllers/index.js";

const router = Router();

router.put("/therapist-to-supervisor", assignTherapistToSupervisor);
router.put("/patient-to-therapist", assignPatientToTherapist);

export default router;
