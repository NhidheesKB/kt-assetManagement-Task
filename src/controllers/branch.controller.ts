import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { branchService } from '../services/branch.service.js';

export const createBranch = asyncHandler(async (req: Request, res: Response) => {
  const branch = await branchService.createBranch(req.body);
  res.status(201).json({
    success: true,
    message: 'Branch created successfully',
    data: branch,
  });
});

export const updateBranch = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const branch = await branchService.updateBranch(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Branch updated successfully',
    data: branch,
  });
});

export const deleteBranch = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await branchService.deleteBranch(id);
  res.status(200).json(result);
});
