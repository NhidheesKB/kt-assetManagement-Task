import { Model, DataTypes, type Optional } from 'sequelize';
import { uuidv7 } from 'uuidv7';
import { sequelize } from '../config/database.js';


export class Branch extends Model {
}

Branch.init(
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
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

  },
  {
    sequelize,
    tableName: 'branches',
    timestamps: true,
    underscored: true,
  }
);
