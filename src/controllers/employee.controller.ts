import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { employeeService } from '../services/employee.service.js';

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee,
  });
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const employee = await employeeService.updateEmployee(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee,
  });
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await employeeService.deleteEmployee(id);
  res.status(200).json(result);
});

export const getActiveEmployees = asyncHandler(async (_req: Request, res: Response) => {
  const result = await employeeService.getAllEmployees({ status: 'ACTIVE' });
  res.status(200).json(
    result.data.map((e) => ({
      id: e.id,
      name: e.name,
      employeeCode: e.employeeCode,
    }))
  );
});
