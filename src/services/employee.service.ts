import { Op } from 'sequelize';
import { Employee, Branch } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetEmployeesQuery,
} from '../schemas/employee.schema.js';

export class EmployeeService {
  async getAllEmployees(query: Partial<GetEmployeesQuery> = {}) {
    const { page, limit, search, status, branchId } = query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employeeCode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    const include = [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name'],
      },
    ];

    if (page || limit) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Employee.findAndCountAll({
        where,
        include,
        limit: l,
        offset,
        order: [['created_at', 'DESC']],
      });

      return {
        data: rows,
        meta: {
          total: count,
          page: p,
          limit: l,
          totalPages: Math.ceil(count / l),
        },
      };
    }

    const employees = await Employee.findAll({
      where,
      include,
      order: [['name', 'ASC']],
    });

    return {
      data: employees,
      meta: { total: employees.length },
    };
  }

  async getEmployeeById(id: string) {
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'city', 'country'],
        },
      ],
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employee;
  }

  async createEmployee(data: CreateEmployeeInput) {
    return await Employee.create(data);
  }

  async updateEmployee(id: string, data: UpdateEmployeeInput) {
    const [affectedCount, affectedRows] = await Employee.update(data, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new AppError('Employee not found', 404);
    }

    return affectedRows[0];
  }

  async deleteEmployee(id: string) {
    const deletedCount = await Employee.destroy({ where: { id } });
    if (deletedCount === 0) {
      throw new AppError('Employee not found', 404);
    }

    return { success: true, message: 'Employee deleted successfully' };
  }
}

export const employeeService = new EmployeeService();
