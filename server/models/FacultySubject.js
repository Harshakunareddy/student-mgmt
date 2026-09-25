const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacultySubject = sequelize.define('FacultySubject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facultyId: { type: DataTypes.INTEGER, allowNull: false },
  subjectId: { type: DataTypes.INTEGER, allowNull: false },
  sectionId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = FacultySubject;
