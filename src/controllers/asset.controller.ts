import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { assetService } from '../services/asset.service.js';

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.createAsset(req.body);
  res.status(201).json({
    success: true,
    message: 'Asset created successfully',
    data: asset,
  });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const asset = await assetService.updateAsset(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Asset updated successfully',
    data: asset,
  });
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await assetService.deleteAsset(id);
  res.status(200).json(result);
});

export const updateAssetStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await assetService.updateStatus(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Asset status updated successfully',
    data: result,
  });
});
