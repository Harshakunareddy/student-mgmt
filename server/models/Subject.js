const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  credits: { type: DataTypes.INTEGER, defaultValue: 3 },
  departmentId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Subject;
