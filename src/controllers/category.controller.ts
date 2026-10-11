import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { categoryService } from '../services/category.service.js';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: 'Asset category created successfully',
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const category = await categoryService.updateCategory(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Asset category updated successfully',
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await categoryService.deleteCategory(id);
  res.status(200).json(result);
});
