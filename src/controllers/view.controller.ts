import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { assetService } from '../services/asset.service.js';
import { branchService } from '../services/branch.service.js';
import { employeeService } from '../services/employee.service.js';
import { categoryService } from '../services/category.service.js';
import {
  getStockQuerySchema,
  getAssetsQuerySchema,
  getAssetHistorySchema,
} from '../schemas/asset.schema.js';
import { getEmployeesQuerySchema } from '../schemas/employee.schema.js';
import { getCategoriesQuerySchema } from '../schemas/category.schema.js';
import { getBranchesQuerySchema } from '../schemas/branch.schema.js';

export const renderStock = asyncHandler(async (req: Request, res: Response) => {
  const query = getStockQuerySchema.shape.query.parse(req.query);
  const stockData = await assetService.getStockView(query);

  res.render('stock', {
    title: 'Stock View',
    currentPath: '/stock',
    assets: stockData.assets,
    byBranch: stockData.byBranch,
    totals: stockData.totals,
    meta: stockData.meta,
    branches: stockData.branches,
    selectedBranch: query.branchId,
    search: query.search || '',
  });
});

export const renderAssets = asyncHandler(async (req: Request, res: Response) => {
  const query = getAssetsQuerySchema.shape.query.parse(req.query);

  const [assetResult, branchResult, categoryResult] = await Promise.all([
    assetService.getAllAssets({
      ...query,
      includeScrapped: query.status === 'SCRAPPED' ? 'true' : undefined,
    }),
    branchService.getAllBranches(),
    categoryService.getAllCategories(),
  ]);

  res.render('assets/index', {
    title: 'Asset Master',
    currentPath: '/assets',
    assets: assetResult.data,
    meta: assetResult.meta,
    branches: branchResult.data,
    categories: categoryResult.data,
    search: query.search || '',
    selectedCategory: query.categoryId,
    selectedBranch: query.branchId,
    selectedStatus: query.status,
  });
});

export const renderAssetHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getAssetHistorySchema.shape.params.parse(req.params);
  const query = getAssetHistorySchema.shape.query.parse(req.query);

  const { asset, data, meta } = await assetService.getAssetHistory(id, query);

  res.render('assets/history', {
    title: `History - ${asset.get('assetCode')}`,
    currentPath: '/assets',
    asset,
    histories: data,
    meta,
  });
});

export const renderEmployees = asyncHandler(async (req: Request, res: Response) => {
  const query = getEmployeesQuerySchema.shape.query.parse(req.query);

  const [employeeResult, branchResult] = await Promise.all([
    employeeService.getAllEmployees(query),
    branchService.getAllBranches(),
  ]);

  res.render('employees/index', {
    title: 'Employee Master',
    currentPath: '/employees',
    employees: employeeResult.data,
    meta: employeeResult.meta,
    branches: branchResult.data,
    search: query.search || '',
    selectedStatus: query.status,
    selectedBranch: query.branchId,
  });
});

export const renderCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = getCategoriesQuerySchema.shape.query.parse(req.query);
  const categoryResult = await categoryService.getAllCategories(query);

  res.render('categories/index', {
    title: 'Asset Category Master',
    currentPath: '/categories',
    categories: categoryResult.data,
    meta: categoryResult.meta,
    search: query.search || '',
  });
});

export const renderBranches = asyncHandler(async (req: Request, res: Response) => {
  const query = getBranchesQuerySchema.shape.query.parse(req.query);
  const branchResult = await branchService.getAllBranches(query);

  res.render('branches/index', {
    title: 'Branch Master',
    currentPath: '/branches',
    branches: branchResult.data,
    meta: branchResult.meta,
    search: query.search || '',
  });
});
