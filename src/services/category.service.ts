import { Op } from 'sequelize';
import { Asset, AssetCategory } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoriesQuery,
} from '../schemas/category.schema.js';

export class CategoryService {
  async getAllCategories(query: Partial<GetCategoriesQuery> = {}) {
    const { page, limit, search } = query;

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (page || limit) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await AssetCategory.findAndCountAll({
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

    const categories = await AssetCategory.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return {
      data: categories,
      meta: { total: categories.length },
    };
  }

  async getCategoryById(id: string) {
    const category = await AssetCategory.findByPk(id);
    if (!category) {
      throw new AppError('Asset category not found', 404);
    }
    return category;
  }

  async createCategory(data: CreateCategoryInput) {
    return await AssetCategory.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const [affectedCount, affectedRows] = await AssetCategory.update(data, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new AppError('Asset category not found', 404);
    }

    return affectedRows[0];
  }

  async deleteCategory(id: string) {
    const category = await AssetCategory.findByPk(id);
    if (!category) {
      throw new AppError('Asset category not found', 404);
    }

    const assetCount = await Asset.count({ where: { category_id: id } });
    if (assetCount > 0) {
      throw new AppError(
        `Cannot delete category because ${assetCount} asset(s) are assigned to it`,
        400
      );
    }

    await category.destroy();
    return { success: true, message: 'Asset category deleted successfully' };
  }
}

export const categoryService = new CategoryService();
