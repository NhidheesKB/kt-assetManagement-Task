import { Branch } from './Branch.js';
import { Employee } from './Employee.js';
import { AssetCategory } from './AssetCategory.js';
import { Asset } from './Asset.js';
import { AssetHistory } from './AssetHistory.js';

Branch.hasMany(Employee, {
  foreignKey: 'branch_id',
  as: 'employees',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Employee.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Branch.hasMany(Asset, {
  foreignKey: 'branch_id',
  as: 'assets',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Asset.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

AssetCategory.hasMany(Asset, {
  foreignKey: 'category_id',
  as: 'assets',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Asset.belongsTo(AssetCategory, {
  foreignKey: 'category_id',
  as: 'category',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Employee.hasMany(Asset, {
  foreignKey: 'issued_to_employee_id',
  as: 'assignedAssets',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

Asset.belongsTo(Employee, {
  foreignKey: 'issued_to_employee_id',
  as: 'issuedToEmployee',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

Asset.hasMany(AssetHistory, {
  foreignKey: 'asset_id',
  as: 'histories',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

AssetHistory.belongsTo(Asset, {
  foreignKey: 'asset_id',
  as: 'asset',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Employee.hasMany(AssetHistory, {
  foreignKey: 'employee_id',
  as: 'assetHistories',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

AssetHistory.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

export { Branch, Employee, AssetCategory, Asset, AssetHistory };
