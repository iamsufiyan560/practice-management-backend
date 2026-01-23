import { Request, Response } from "express";

export const getAdminDashboard = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getSupervisorDashboard = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};

export const getTherapistDashboard = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
};
