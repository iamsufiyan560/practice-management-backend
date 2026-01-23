import { Request, Response } from "express";

export const createAdmin = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
  // ...
};

export const getAllAdminsByPractice = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
  // ...
};

export const getAdminById = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
  // ...
};

export const updateAdmin = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
  // ...
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const practiceId = req.practiceId;
  // ...
};
