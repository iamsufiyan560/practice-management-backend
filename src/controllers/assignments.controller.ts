import { Request, Response } from "express";

export const assignTherapistToSupervisor = async (
  req: Request,
  res: Response,
) => {
  const practiceId = req.practiceId;
};

export const assignPatientToTherapist = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};
