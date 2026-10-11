import { Model, DataTypes } from 'sequelize';
import { uuidv7 } from 'uuidv7';
import { sequelize } from '../config/database.js';

export class AssetCategory extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AssetCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv7(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'asset_categories',
    timestamps: true,
    underscored: true,
  }
);
