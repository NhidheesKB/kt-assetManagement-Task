import { Op } from 'sequelize';
import { Branch } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateBranchInput,
  UpdateBranchInput,
  GetBranchesQuery,
} from '../schemas/branch.schema.js';

export class BranchService {
  async getAllBranches(query: Partial<GetBranchesQuery> = {}) {
    const { page, limit, search } = query;
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { country: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (page || limit) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Branch.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [['name', 'ASC']],
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

    const branches = await Branch.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return {
      data: branches,
      meta: { total: branches.length },
    };
  }

  async getBranchById(id: string) {
    const branch = await Branch.findByPk(id);
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }
    return branch;
  }

  async createBranch(data: CreateBranchInput) {
    return await Branch.create(data);
  }

  async updateBranch(id: string, data: UpdateBranchInput) {
    const [affectedCount, affectedRows] = await Branch.update(data, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new AppError('Branch not found', 404);
    }

    return affectedRows[0];
  }

  async deleteBranch(id: string) {
    const deletedCount = await Branch.destroy({ where: { id } });
    if (deletedCount === 0) {
      throw new AppError('Branch not found', 404);
    }

    return { success: true, message: 'Branch deleted successfully' };
  }
}

export const branchService = new BranchService();
