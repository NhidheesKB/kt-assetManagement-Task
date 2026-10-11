import { Model, DataTypes, Sequelize } from 'sequelize';
import { uuidv7 } from 'uuidv7';
import { sequelize } from '../config/database.js';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export class Employee extends Model {
  declare id: string;
  declare employeeCode: string;
  declare name: string;
  declare email: string;
  declare branchId: string;
  declare status: EmployeeStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv7(),
      primaryKey: true,
    },
    employeeCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'employee_code',
      defaultValue: Sequelize.literal("'EMP-' || LPAD(nextval('employee_code_seq')::text, 3, '0')"),
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
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
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    tableName: 'employees',
    timestamps: true,
    underscored: true,
    indexes: [
      { name: 'idx_employees_employee_code_unique', fields: ['employee_code'], unique: true },
      { name: 'idx_employees_email_unique', fields: ['email'], unique: true },
      { name: 'idx_employees_branch_id', fields: ['branch_id'] },
      { name: 'idx_employees_status_branch', fields: ['status', 'branch_id'] },
    ],
  }
);
