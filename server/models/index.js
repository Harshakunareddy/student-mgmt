const User = require('./User');
const Department = require('./Department');
const Class = require('./Class');
const Section = require('./Section');
const Subject = require('./Subject');
const Student = require('./Student');
const FacultySubject = require('./FacultySubject');
const Attendance = require('./Attendance');

Department.hasMany(Class, { foreignKey: 'departmentId' });
Class.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Subject, { foreignKey: 'departmentId' });
Subject.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });

Class.hasMany(Section, { foreignKey: 'classId' });
Section.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

Section.hasMany(Student, { foreignKey: 'sectionId' });
Student.belongsTo(Section, { foreignKey: 'sectionId' });

User.hasMany(FacultySubject, { foreignKey: 'facultyId' });
FacultySubject.belongsTo(User, { as: 'Faculty', foreignKey: 'facultyId' });

Subject.hasMany(FacultySubject, { foreignKey: 'subjectId' });
FacultySubject.belongsTo(Subject, { foreignKey: 'subjectId' });

Section.hasMany(FacultySubject, { foreignKey: 'sectionId' });
FacultySubject.belongsTo(Section, { foreignKey: 'sectionId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

Subject.hasMany(Attendance, { foreignKey: 'subjectId' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId' });

Section.hasMany(Attendance, { foreignKey: 'sectionId' });
Attendance.belongsTo(Section, { foreignKey: 'sectionId' });

User.hasMany(Attendance, { as: 'MarkedAttendances', foreignKey: 'markedBy' });
Attendance.belongsTo(User, { as: 'MarkedByUser', foreignKey: 'markedBy' });

module.exports = { User, Department, Class, Section, Subject, Student, FacultySubject, Attendance };
