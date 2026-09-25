const express = require('express');
const { User, Student, Subject, Section, Attendance, Class, Department } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authenticate, authorize('student'));

router.get('/dashboard', async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{ model: Section, include: [{ model: Class, as: 'class', include: [Department] }] }]
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const subjects = await Subject.findAll({
      where: { departmentId: student.Section.class.departmentId }
    });

    const subjectStats = [];
    for (const subject of subjects) {
      const totalClasses = await Attendance.count({
        where: { subjectId: subject.id, sectionId: student.sectionId },
        group: ['date']
      });
      const totalDays = totalClasses.length;

      const attended = await Attendance.count({
        where: {
          studentId: student.id,
          subjectId: subject.id,
          status: { [Op.in]: ['present', 'late'] }
        }
      });

      const percentage = totalDays > 0 ? Math.round((attended / totalDays) * 100 * 100) / 100 : 0;

      subjectStats.push({
        subject: { id: subject.id, name: subject.name, code: subject.code },
        totalClasses: totalDays,
        attended,
        percentage
      });
    }

    const totalAll = subjectStats.reduce((sum, s) => sum + s.totalClasses, 0);
    const attendedAll = subjectStats.reduce((sum, s) => sum + s.attended, 0);
    const overallPercentage = totalAll > 0 ? Math.round((attendedAll / totalAll) * 100 * 100) / 100 : 0;

    res.json({
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        name: req.user.name,
        section: student.Section.name,
        className: student.Section.class.name,
        department: student.Section.class.Department.name
      },
      overallPercentage,
      subjectStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/attendance', async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { subjectId, startDate, endDate } = req.query;
    const where = { studentId: student.id };
    if (subjectId) where.subjectId = subjectId;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

    const records = await Attendance.findAll({
      where,
      include: [Subject, Section],
      order: [['date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
