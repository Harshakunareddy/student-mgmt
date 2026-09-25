const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { User, Department, Class, Section, Subject, Student, FacultySubject, Attendance } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    const departments = await Department.bulkCreate([
      { name: 'Computer Science', code: 'CSE' },
      { name: 'Electronics', code: 'ECE' },
      { name: 'Mechanical', code: 'ME' },
      { name: 'Civil', code: 'CE' }
    ]);
    console.log('Departments created');

    const classes = [];
    for (const dept of departments) {
      const c1 = await Class.create({ name: `${dept.code} Year 1`, year: 1, semester: 1, departmentId: dept.id });
      const c2 = await Class.create({ name: `${dept.code} Year 2`, year: 2, semester: 3, departmentId: dept.id });
      classes.push(c1, c2);
    }
    console.log('Classes created');

    const sections = [];
    for (const cls of classes) {
      const sA = await Section.create({ name: 'Section A', classId: cls.id });
      const sB = await Section.create({ name: 'Section B', classId: cls.id });
      sections.push(sA, sB);
    }
    console.log('Sections created');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@edumerge.com',
      password: hashedPassword,
      role: 'admin',
      departmentId: null
    });
    console.log('Admin created: admin@edumerge.com / password123');

    const subjectData = [
      { name: 'Data Structures', code: 'CS201', departmentId: departments[0].id },
      { name: 'Algorithms', code: 'CS202', departmentId: departments[0].id },
      { name: 'Database Systems', code: 'CS301', departmentId: departments[0].id },
      { name: 'Operating Systems', code: 'CS302', departmentId: departments[0].id },
      { name: 'Digital Electronics', code: 'EC201', departmentId: departments[1].id },
      { name: 'Signal Processing', code: 'EC202', departmentId: departments[1].id },
      { name: 'Thermodynamics', code: 'ME201', departmentId: departments[2].id },
      { name: 'Fluid Mechanics', code: 'ME202', departmentId: departments[2].id },
      { name: 'Structural Analysis', code: 'CE201', departmentId: departments[3].id },
      { name: 'Surveying', code: 'CE202', departmentId: departments[3].id }
    ];
    const subjects = await Subject.bulkCreate(subjectData);
    console.log('Subjects created');

    const facultyNames = [
      'Dr. Rajesh Kumar', 'Prof. Anita Sharma', 'Dr. Vikram Singh',
      'Prof. Priya Patel', 'Dr. Suresh Reddy', 'Prof. Meena Gupta',
      'Dr. Arun Joshi', 'Prof. Kavita Nair'
    ];

    const facultyUsers = [];
    for (let i = 0; i < facultyNames.length; i++) {
      const deptIndex = Math.floor(i / 2);
      const f = await User.create({
        name: facultyNames[i],
        email: `faculty${i + 1}@edumerge.com`,
        password: hashedPassword,
        role: 'faculty',
        departmentId: departments[deptIndex].id
      });
      facultyUsers.push(f);
    }
    console.log('Faculty created');

    const cseSections = sections.filter((s, i) => i < 4);
    await FacultySubject.create({ facultyId: facultyUsers[0].id, subjectId: subjects[0].id, sectionId: cseSections[0].id });
    await FacultySubject.create({ facultyId: facultyUsers[0].id, subjectId: subjects[0].id, sectionId: cseSections[1].id });
    await FacultySubject.create({ facultyId: facultyUsers[0].id, subjectId: subjects[1].id, sectionId: cseSections[0].id });
    await FacultySubject.create({ facultyId: facultyUsers[1].id, subjectId: subjects[2].id, sectionId: cseSections[2].id });
    await FacultySubject.create({ facultyId: facultyUsers[1].id, subjectId: subjects[3].id, sectionId: cseSections[3].id });
    console.log('Faculty-Subject assignments created');

    const studentNames = [
      'Aarav Mehta', 'Diya Iyer', 'Rohan Deshmukh', 'Ishita Kapoor', 'Arjun Nair',
      'Sneha Reddy', 'Kabir Singh', 'Ananya Das', 'Vivaan Jain', 'Tanya Agarwal',
      'Reyansh Gupta', 'Saanvi Rao', 'Advait Kulkarni', 'Myra Bhat', 'Krishna Pillai',
      'Anika Verma', 'Dhruv Saxena', 'Navya Mishra', 'Aarush Pandey', 'Riya Chakraborty'
    ];

    const studentUsers = [];
    for (let i = 0; i < studentNames.length; i++) {
      const sectionIndex = i % 4;
      const deptIndex = Math.floor(sectionIndex / 2) < 2 ? 0 : 1;
      const s = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@edumerge.com`,
        password: hashedPassword,
        role: 'student',
        departmentId: departments[0].id
      });
      await Student.create({
        userId: s.id,
        rollNumber: `2024${String(i + 1).padStart(4, '0')}`,
        sectionId: cseSections[sectionIndex % cseSections.length].id
      });
      studentUsers.push(s);
    }
    console.log('Students created');

    const today = new Date();
    const statuses = ['present', 'absent', 'late'];

    for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const studentsInSection = await Student.findAll({ where: { sectionId: cseSections[0].id } });

      for (const student of studentsInSection) {
        const rand = Math.random();
        let status = 'present';
        if (rand < 0.15) status = 'absent';
        else if (rand < 0.25) status = 'late';

        await Attendance.create({
          studentId: student.id,
          subjectId: subjects[0].id,
          sectionId: cseSections[0].id,
          date: dateStr,
          status,
          markedBy: facultyUsers[0].id
        });
      }
    }
    console.log('Sample attendance created');

    console.log('\n=== Login Credentials ===');
    console.log('Admin:   admin@edumerge.com / password123');
    console.log('Faculty: faculty1@edumerge.com / password123');
    console.log('Student: student1@edumerge.com / password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
