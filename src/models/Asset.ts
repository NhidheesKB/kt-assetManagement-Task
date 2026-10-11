import { Model, DataTypes, Sequelize } from 'sequelize';
import { uuidv7 } from 'uuidv7';
import { sequelize } from '../config/database.js';

export type AssetStatus = 'IN_STOCK' | 'ISSUED' | 'REPAIR' | 'SCRAPPED';

export class Asset extends Model {
  declare id: string;
  declare assetCode: string;
  declare serialNumber: string;
  declare categoryId: string;
  declare branchId: string;
  declare make: string | null;
  declare model: string | null;
  declare purchaseDate: string | null;
  declare purchaseValue: number;
  declare status: AssetStatus;
  declare issuedToEmployeeId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Asset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv7(),
      primaryKey: true,
    },
    assetCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'asset_code',
      defaultValue: Sequelize.literal("'ASSET-' || LPAD(nextval('asset_code_seq')::text, 3, '0')"),
    },
    serialNumber: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'serial_number',
      validate: {
        notEmpty: true,
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'asset_categories',
        key: 'id',
      },
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'branch_id',
      references: {
        model: 'branches',
        key: 'id',
      },
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'purchase_date',
    },
    purchaseValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'purchase_value',
    },
    status: {
      type: DataTypes.ENUM('IN_STOCK', 'ISSUED', 'REPAIR', 'SCRAPPED'),
      allowNull: false,
      defaultValue: 'IN_STOCK',
    },
    issuedToEmployeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'issued_to_employee_id',
      references: {
        model: 'employees',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'assets',
    timestamps: true,
    underscored: true,
    indexes: [
      { name: 'idx_assets_asset_code_unique', fields: ['asset_code'], unique: true },
      { name: 'idx_assets_serial_number_unique', fields: ['serial_number'], unique: true },
      { name: 'idx_assets_category_id', fields: ['category_id'] },
      { name: 'idx_assets_branch_id', fields: ['branch_id'] },
      { name: 'idx_assets_status_branch', fields: ['status', 'branch_id'] },
      { name: 'idx_assets_issued_employee', fields: ['issued_to_employee_id'] },
      { name: 'idx_assets_make_model', fields: ['make', 'model'] },
    ],
  }
);
