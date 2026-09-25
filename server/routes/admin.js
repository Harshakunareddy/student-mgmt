const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Department, Class, Section, Subject, Student, FacultySubject, Attendance } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalFaculty = await User.count({ where: { role: 'faculty' } });
    const totalDepartments = await Department.count();
    const totalSubjects = await Subject.count();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.count({ where: { date: today } });
    const todayPresent = await Attendance.count({ where: { date: today, status: 'present' } });

    res.json({ totalStudents, totalFaculty, totalDepartments, totalSubjects, todayAttendance, todayPresent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    await Department.update(req.body, { where: { id: req.params.id } });
    const dept = await Department.findByPk(req.params.id);
    res.json(dept);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await Department.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.findAll({ include: [Department], order: [['name', 'ASC']] });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    const result = await Class.findByPk(cls.id, { include: [Department] });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    await Class.update(req.body, { where: { id: req.params.id } });
    const cls = await Class.findByPk(req.params.id, { include: [Department] });
    res.json(cls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    await Class.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/sections', async (req, res) => {
  try {
    const where = {};
    if (req.query.classId) where.classId = req.query.classId;
    const sections = await Section.findAll({
      where,
      include: [{ model: Class, as: 'class', include: [Department] }],
      order: [['name', 'ASC']]
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const section = await Section.create(req.body);
    const result = await Section.findByPk(section.id, { include: [{ model: Class, as: 'class', include: [Department] }] });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/sections/:id', async (req, res) => {
  try {
    await Section.update(req.body, { where: { id: req.params.id } });
    const section = await Section.findByPk(req.params.id, { include: [{ model: Class, as: 'class', include: [Department] }] });
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/sections/:id', async (req, res) => {
  try {
    await Section.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.findAll({ include: [Department], order: [['name', 'ASC']] });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    const result = await Subject.findByPk(subject.id, { include: [Department] });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    await Subject.update(req.body, { where: { id: req.params.id } });
    const subject = await Subject.findByPk(req.params.id, { include: [Department] });
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [Department],
      order: [['name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, departmentId, rollNumber, sectionId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, departmentId });

    if (role === 'student' && rollNumber && sectionId) {
      await Student.create({ userId: user.id, rollNumber, sectionId });
    }

    const result = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [Department]
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, departmentId, rollNumber, sectionId, password } = req.body;
    const updateData = { name, email, role, departmentId };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await User.update(updateData, { where: { id: req.params.id } });

    if (role === 'student') {
      const student = await Student.findOne({ where: { userId: req.params.id } });
      if (student) {
        await Student.update({ rollNumber, sectionId }, { where: { userId: req.params.id } });
      } else {
        await Student.create({ userId: req.params.id, rollNumber, sectionId });
      }
    }

    const result = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [Department]
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await Student.destroy({ where: { userId: req.params.id } });
    await FacultySubject.destroy({ where: { facultyId: req.params.id } });
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/faculty-subjects', async (req, res) => {
  try {
    const assignments = await FacultySubject.findAll({
      include: [
        { model: User, as: 'Faculty', attributes: { exclude: ['password'] } },
        Subject,
        Section
      ]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/faculty-subjects', async (req, res) => {
  try {
    const assignment = await FacultySubject.create(req.body);
    const result = await FacultySubject.findByPk(assignment.id, {
      include: [
        { model: User, as: 'Faculty', attributes: { exclude: ['password'] } },
        Subject,
        Section
      ]
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/faculty-subjects/:id', async (req, res) => {
  try {
    await FacultySubject.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/attendance-report', async (req, res) => {
  try {
    const { departmentId, classId, sectionId, subjectId, startDate, endDate } = req.query;
    const where = {};
    if (subjectId) where.subjectId = subjectId;
    if (sectionId) where.sectionId = sectionId;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

    const records = await Attendance.findAll({
      where,
      include: [
        { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
        Subject,
        Section
      ],
      order: [['date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
