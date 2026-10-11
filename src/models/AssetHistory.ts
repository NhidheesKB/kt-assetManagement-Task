import { Model, DataTypes } from 'sequelize';
import { uuidv7 } from 'uuidv7';
import { sequelize } from '../config/database.js';

export class AssetHistory extends Model {
}

AssetHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv7(),
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'asset_id',
      references: {
        model: 'assets',
        key: 'id',
      },
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'employee_id',
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('PURCHASE', 'ISSUE', 'RETURN', 'REPAIR', 'SCRAP'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    performedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'performed_at',
    },
  },
  {
    sequelize,
    tableName: 'asset_histories',
    timestamps: true,
    underscored: true,
    indexes: [
      { name: 'idx_asset_histories_asset_id', fields: ['asset_id'] },
      { name: 'idx_asset_histories_employee_id', fields: ['employee_id'] },
      { name: 'idx_asset_histories_action', fields: ['action'] },
      { name: 'idx_asset_histories_performed_at', fields: ['performed_at'] },
    ],
  }
);
