import { Op, fn, col } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Asset, AssetCategory, Branch, Employee, AssetHistory } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateAssetInput,
  UpdateAssetInput,
  GetAssetsQuery,
  UpdateAssetStatusInput,
  GetStockQuery,
  GetAssetHistoryQuery,
} from '../schemas/asset.schema.js';

export class AssetService {
  async getAllAssets(query: Partial<GetAssetsQuery> = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      branchId,
      status,
      includeScrapped,
    } = query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { assetCode: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (branchId) where.branchId = branchId;

    if (status) {
      where.status = status;
    } else if (includeScrapped !== 'true') {
      where.status = { [Op.ne]: 'SCRAPPED' };
    }

    const include = [
      { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
      { model: Branch, as: 'branch', attributes: ['id', 'name', 'city'] },
      { model: Employee, as: 'issuedToEmployee', attributes: ['id', 'name', 'employeeCode'] },
    ];

    const offset = (page - 1) * limit;
    const { count, rows } = await Asset.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getAssetById(id: string) {
    const asset = await Asset.findByPk(id, {
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name', 'description'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name', 'city', 'country', 'address'] },
        { model: Employee, as: 'issuedToEmployee', attributes: ['id', 'name', 'employeeCode', 'email'] },
      ],
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    return asset;
  }

  async createAsset(data: CreateAssetInput) {
    return await sequelize.transaction(async (t) => {
      const asset = await Asset.create(
        {
          ...data,
          status: 'IN_STOCK',
        },
        { transaction: t }
      );

      await AssetHistory.create(
        {
          assetId: asset.id,
          action: 'PURCHASE',
          remarks: `Initial asset registration. Purchase value: ${data.purchaseValue}`,
          performedAt: new Date(),
        },
        { transaction: t }
      );

      return asset;
    });
  }

  async updateAsset(id: string, data: UpdateAssetInput) {
    const [affectedCount, affectedRows] = await Asset.update(data, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new AppError('Asset not found', 404);
    }

    return affectedRows[0];
  }

  async deleteAsset(id: string) {
    const asset = await Asset.findByPk(id);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    if (asset.status === 'ISSUED') {
      throw new AppError('Cannot delete an asset that is currently issued. Return it first.', 400);
    }

    await asset.destroy();
    return { success: true, message: 'Asset deleted successfully' };
  }

  async updateStatus(id: string, data: UpdateAssetStatusInput) {
    return await sequelize.transaction(async (t) => {
      const asset = await Asset.findByPk(id, { transaction: t });
      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      switch (data.action) {
        case 'ISSUE': {
          if (asset.status !== 'IN_STOCK' && asset.status !== 'REPAIR') {
            throw new AppError(`Asset cannot be issued because its current status is ${asset.status}`, 400);
          }

          const employee = await Employee.findByPk(data.employeeId, { transaction: t });
          if (!employee) {
            throw new AppError('Employee not found', 404);
          }

          if (employee.status !== 'ACTIVE') {
            throw new AppError('Cannot issue asset to an inactive employee', 400);
          }

          if (asset.status === 'REPAIR') {
            await AssetHistory.create(
              {
                assetId: asset.id,
                action: 'REPAIR',
                reason: 'Repair Completed',
                remarks: 'Maintenance completed, issued directly to employee',
                performedAt: new Date(),
              },
              { transaction: t }
            );
          }

          asset.status = 'ISSUED';
          asset.set('issuedToEmployeeId', data.employeeId);
          await asset.save({ transaction: t });

          const history = await AssetHistory.create(
            {
              assetId: asset.id,
              employeeId: employee.id,
              action: 'ISSUE',
              remarks: data.remarks || null,
              performedAt: new Date(),
            },
            { transaction: t }
          );

          return { asset, history };
        }

        case 'REPAIR': {
          if (asset.status !== 'REPAIR') {
            throw new AppError(`Asset is not currently in repair (current status: ${asset.status})`, 400);
          }

          if (data.employeeId) {
            const employee = await Employee.findByPk(data.employeeId, { transaction: t });
            if (!employee) {
              throw new AppError('Employee not found', 404);
            }
            if (employee.status !== 'ACTIVE') {
              throw new AppError('Cannot issue asset to an inactive employee', 400);
            }

            asset.status = 'ISSUED';
            asset.set('issuedToEmployeeId', data.employeeId);
            await asset.save({ transaction: t });

            await AssetHistory.create(
              {
                assetId: asset.id,
                action: 'REPAIR',
                reason: data.reason || 'Repair Completed',
                remarks: data.remarks || 'Maintenance completed',
                performedAt: new Date(),
              },
              { transaction: t }
            );

            const history = await AssetHistory.create(
              {
                assetId: asset.id,
                employeeId: employee.id,
                action: 'ISSUE',
                remarks: `Re-issued to ${employee.name} following repair completion`,
                performedAt: new Date(),
              },
              { transaction: t }
            );

            return { asset, history };
          }

          asset.status = 'IN_STOCK';
          await asset.save({ transaction: t });

          const history = await AssetHistory.create(
            {
              assetId: asset.id,
              action: 'REPAIR',
              reason: data.reason || 'Repair Completed',
              remarks: data.remarks || 'Maintenance completed, asset returned to stock',
              performedAt: new Date(),
            },
            { transaction: t }
          );

          return { asset, history };
        }

        case 'RETURN': {
          if (asset.status !== 'ISSUED') {
            throw new AppError(`Asset is not currently issued (current status: ${asset.status})`, 400);
          }

          const previousEmployeeId = asset.get('issuedToEmployeeId') as string | null;

          asset.status = data.condition || 'IN_STOCK';
          asset.set('issuedToEmployeeId', null);
          await asset.save({ transaction: t });

          const history = await AssetHistory.create(
            {
              assetId: asset.id,
              employeeId: previousEmployeeId,
              action: 'RETURN',
              reason: data.reason,
              remarks: data.remarks || null,
              performedAt: new Date(),
            },
            { transaction: t }
          );

          return { asset, history };
        }

        case 'SCRAP': {
          if (asset.status === 'SCRAPPED') {
            throw new AppError('Asset is already marked as scrapped', 400);
          }

          const previousEmployeeId = asset.get('issuedToEmployeeId') as string | null;

          asset.status = 'SCRAPPED';
          asset.set('issuedToEmployeeId', null);
          await asset.save({ transaction: t });

          const history = await AssetHistory.create(
            {
              assetId: asset.id,
              employeeId: previousEmployeeId,
              action: 'SCRAP',
              reason: data.reason,
              remarks: data.remarks || null,
              performedAt: new Date(),
            },
            { transaction: t }
          );

          return { asset, history };
        }
      }
    });
  }

  async getStockView(query: Partial<GetStockQuery> = {}) {
    const { branchId, search, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { status: 'IN_STOCK' };
    if (branchId) where.branchId = branchId;
    if (search) {
      where[Op.or] = [
        { assetCode: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const [assetsResult, branchSummary] = await Promise.all([
      Asset.findAndCountAll({
        where,
        include: [
          { model: Branch, as: 'branch', attributes: ['id', 'name', 'city'] },
          { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
      }),
      Asset.findAll({
        where: { status: 'IN_STOCK' },
        attributes: [
          'branchId',
          [fn('COUNT', col('Asset.id')), 'count'],
          [fn('COALESCE', fn('SUM', col('purchase_value')), 0), 'totalValue'],
        ],
        include: [
          { model: Branch, as: 'branch', attributes: ['id', 'name', 'city'] },
        ],
        group: ['Asset.branch_id', 'branch.id', 'branch.name', 'branch.city'],
        raw: true,
        nest: true,
      }),
    ]);
    let totalCount = 0;
    let totalValue = 0;
    const branches: { id: string; name: string }[] = [];

    const byBranch = (branchSummary as any[]).map((item) => {
      const count = Number(item.count) || 0;
      const val = Number(Number(item.totalValue).toFixed(2)) || 0;
      const branchName = item.branch?.name || 'Unknown Branch';

      totalCount += count;
      totalValue += val;
      branches.push({ id: item.branchId, name: branchName });

      return {
        branchId: item.branchId,
        branchName,
        city: item.branch?.city || '',
        count,
        totalValue: val,
      };
    });

    return {
      assets: assetsResult.rows,
      byBranch,
      branches,
      totals: {
        totalCount,
        totalValue: Number(totalValue.toFixed(2)),
      },
      meta: {
        total: assetsResult.count,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(assetsResult.count / limit)),
      },
    };
  }

  async getAssetHistory(id: string, query: Partial<GetAssetHistoryQuery> = {}) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const [asset, { count, rows }] = await Promise.all([
      this.getAssetById(id),
      AssetHistory.findAndCountAll({
        where: { assetId: id },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'name', 'employeeCode', 'email'],
          },
        ],
        limit,
        offset,
        order: [['performed_at', 'ASC']],
      }),
    ]);

    return {
      asset,
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export const assetService = new AssetService();
