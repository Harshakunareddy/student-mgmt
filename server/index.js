const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📦 Database connected successfully\n`);
  });
}).catch(err => {
  console.error('\n❌ DATABASE CONNECTION FAILED\n');

  if (err.original?.code === 'ECONNREFUSED') {
    console.error('🔴 MySQL is not running!');
    console.error('   → Start MySQL server and try again');
    console.error('   → On Windows: Open Services → MySQL → Start');
    console.error('   → Or run: net start MySQL\n');
  } else if (err.original?.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('🔴 Invalid MySQL credentials!');
    console.error('   → Check DB_USER and DB_PASSWORD in server/.env');
    console.error(`   → Current: user="${process.env.DB_USER}", host="${process.env.DB_HOST}"\n`);
  } else if (err.original?.code === 'ER_BAD_DB_ERROR') {
    console.error('🔴 Database does not exist!');
    console.error(`   → Create it: CREATE DATABASE ${process.env.DB_NAME};`);
    console.error('   → Then run: npm run seed\n');
  } else {
    console.error('🔴 Error:', err.message, '\n');
  }

  process.exit(1);
});
