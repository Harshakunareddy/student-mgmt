const express = require('express');
const { User, Student, Subject, Section, FacultySubject, Attendance, Class, Department } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const router = express.Router();

router.use(authenticate, authorize('faculty'));

router.get('/my-subjects', async (req, res) => {
  try {
    const assignments = await FacultySubject.findAll({
      where: { facultyId: req.user.id },
      include: [
        Subject,
        { model: Section, include: [{ model: Class, as: 'class', include: [Department] }] }
      ]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/students/:sectionId', async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { sectionId: req.params.sectionId },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [[User, 'name', 'ASC']]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/mark-attendance', async (req, res) => {
  try {
    const { subjectId, sectionId, date, attendance } = req.body;

    const assignment = await FacultySubject.findOne({
      where: { facultyId: req.user.id, subjectId, sectionId }
    });
    if (!assignment) return res.status(403).json({ message: 'Not assigned to this subject/section' });

    const existing = await Attendance.findAll({
      where: { subjectId, sectionId, date }
    });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const records = attendance.map(a => ({
      studentId: a.studentId,
      subjectId,
      sectionId,
      date,
      status: a.status,
      markedBy: req.user.id
    }));

    await Attendance.bulkCreate(records);
    res.status(201).json({ message: 'Attendance marked successfully', count: records.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/attendance-history', async (req, res) => {
  try {
    const { subjectId, sectionId, date, startDate, endDate } = req.query;
    const where = { markedBy: req.user.id };
    if (subjectId) where.subjectId = subjectId;
    if (sectionId) where.sectionId = sectionId;
    if (date) where.date = date;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

    const records = await Attendance.findAll({
      where,
      include: [
        { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
        Subject,
        Section
      ],
      order: [['date', 'DESC'], [Student, User, 'name', 'ASC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/correct-attendance/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.markedBy !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { status, remarks } = req.body;
    await record.update({ status, remarks: remarks || `Corrected on ${new Date().toISOString().split('T')[0]}` });

    const updated = await Attendance.findByPk(req.params.id, {
      include: [
        { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
        Subject
      ]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/low-attendance', async (req, res) => {
  try {
    const { subjectId, sectionId, threshold = 75 } = req.query;
    const where = {};
    if (subjectId) where.subjectId = subjectId;
    if (sectionId) where.sectionId = sectionId;

    const assignments = await FacultySubject.findAll({
      where: { facultyId: req.user.id },
      attributes: ['subjectId', 'sectionId']
    });

    const results = [];

    for (const assign of assignments) {
      if (subjectId && parseInt(subjectId) !== assign.subjectId) continue;
      if (sectionId && parseInt(sectionId) !== assign.sectionId) continue;

      const students = await Student.findAll({
        where: { sectionId: assign.sectionId },
        include: [{ model: User, attributes: ['name', 'email'] }]
      });

      const totalClasses = await Attendance.count({
        where: { subjectId: assign.subjectId, sectionId: assign.sectionId },
        group: ['date']
      });
      const totalDays = totalClasses.length;

      if (totalDays === 0) continue;

      const subject = await Subject.findByPk(assign.subjectId);
      const section = await Section.findByPk(assign.sectionId, {
        include: [{ model: Class, as: 'class' }]
      });

      for (const student of students) {
        const presentCount = await Attendance.count({
          where: {
            studentId: student.id,
            subjectId: assign.subjectId,
            sectionId: assign.sectionId,
            status: { [Op.in]: ['present', 'late'] }
          }
        });

        const percentage = (presentCount / totalDays) * 100;

        if (percentage < parseFloat(threshold)) {
          results.push({
            student: { id: student.id, rollNumber: student.rollNumber, name: student.User.name, email: student.User.email },
            subject: { id: subject.id, name: subject.name, code: subject.code },
            section: { id: section.id, name: section.name, className: section.class?.name },
            totalClasses: totalDays,
            attended: presentCount,
            percentage: Math.round(percentage * 100) / 100
          });
        }
      }
    }

    results.sort((a, b) => a.percentage - b.percentage);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/dashboard-stats', async (req, res) => {
  try {
    const assignments = await FacultySubject.findAll({ where: { facultyId: req.user.id } });
    const today = new Date().toISOString().split('T')[0];
    let todayMarked = 0;
    let totalStudents = 0;

    for (const a of assignments) {
      const count = await Attendance.count({ where: { subjectId: a.subjectId, sectionId: a.sectionId, date: today } });
      if (count > 0) todayMarked++;
      const stuCount = await Student.count({ where: { sectionId: a.sectionId } });
      totalStudents += stuCount;
    }

    res.json({
      totalSubjects: assignments.length,
      todayMarked,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
