require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize } = require('./connection');
const { User, Student, Prediction } = require('../models');
const { predictDropoutRisk } = require('../utils/mlPredictor');
const bcrypt = require('bcryptjs');

const sampleStudents = [
  { studentId: 'STU001', name: 'Alice Johnson', email: 'alice@example.com', age: 20, gender: 'Female', department: 'Computer Science', semester: 4, attendancePercentage: 85, cgpa: 7.8, assignmentSubmissionRate: 90, lmsActivityScore: 75, internalMarks: 78, backlogs: 0, participationScore: 80, financialStatus: 'Good' },
  { studentId: 'STU002', name: 'Bob Smith', email: 'bob@example.com', age: 21, gender: 'Male', department: 'Electronics', semester: 5, attendancePercentage: 45, cgpa: 4.2, assignmentSubmissionRate: 35, lmsActivityScore: 20, internalMarks: 38, backlogs: 4, participationScore: 25, financialStatus: 'Poor' },
  { studentId: 'STU003', name: 'Carol Davis', email: 'carol@example.com', age: 19, gender: 'Female', department: 'Mathematics', semester: 2, attendancePercentage: 62, cgpa: 5.5, assignmentSubmissionRate: 60, lmsActivityScore: 55, internalMarks: 52, backlogs: 2, participationScore: 50, financialStatus: 'Average' },
  { studentId: 'STU004', name: 'David Wilson', email: 'david@example.com', age: 22, gender: 'Male', department: 'Computer Science', semester: 6, attendancePercentage: 92, cgpa: 9.1, assignmentSubmissionRate: 95, lmsActivityScore: 90, internalMarks: 88, backlogs: 0, participationScore: 92, financialStatus: 'Good' },
  { studentId: 'STU005', name: 'Emma Brown', email: 'emma@example.com', age: 20, gender: 'Female', department: 'Physics', semester: 3, attendancePercentage: 38, cgpa: 3.8, assignmentSubmissionRate: 28, lmsActivityScore: 15, internalMarks: 30, backlogs: 6, participationScore: 20, financialStatus: 'Poor' },
  { studentId: 'STU006', name: 'Frank Miller', email: 'frank@example.com', age: 23, gender: 'Male', department: 'Electronics', semester: 7, attendancePercentage: 71, cgpa: 6.2, assignmentSubmissionRate: 65, lmsActivityScore: 60, internalMarks: 58, backlogs: 1, participationScore: 55, financialStatus: 'Average' },
  { studentId: 'STU007', name: 'Grace Lee', email: 'grace@example.com', age: 20, gender: 'Female', department: 'Computer Science', semester: 4, attendancePercentage: 88, cgpa: 8.5, assignmentSubmissionRate: 92, lmsActivityScore: 85, internalMarks: 82, backlogs: 0, participationScore: 78, financialStatus: 'Good' },
  { studentId: 'STU008', name: 'Henry Taylor', email: 'henry@example.com', age: 21, gender: 'Male', department: 'Mathematics', semester: 5, attendancePercentage: 30, cgpa: 2.9, assignmentSubmissionRate: 20, lmsActivityScore: 10, internalMarks: 22, backlogs: 8, participationScore: 15, financialStatus: 'Poor' },
  { studentId: 'STU009', name: 'Ivy Chen', email: 'ivy@example.com', age: 19, gender: 'Female', department: 'Physics', semester: 2, attendancePercentage: 79, cgpa: 7.1, assignmentSubmissionRate: 80, lmsActivityScore: 72, internalMarks: 70, backlogs: 0, participationScore: 68, financialStatus: 'Average' },
  { studentId: 'STU010', name: 'Jack Anderson', email: 'jack@example.com', age: 22, gender: 'Male', department: 'Computer Science', semester: 6, attendancePercentage: 55, cgpa: 5.0, assignmentSubmissionRate: 50, lmsActivityScore: 45, internalMarks: 48, backlogs: 3, participationScore: 40, financialStatus: 'Average' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected to database...');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@eduguard.ai' } });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@eduguard.ai',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true,
        isActive: true,
        department: 'Administration',
      });
      console.log('Admin user created: admin@eduguard.ai / Admin@123');
    }

    // Create teacher
    const teacherExists = await User.findOne({ where: { email: 'teacher@eduguard.ai' } });
    let teacher;
    if (!teacherExists) {
      teacher = await User.create({
        name: 'Prof. Sarah Williams',
        email: 'teacher@eduguard.ai',
        password: 'Teacher@123',
        role: 'teacher',
        isVerified: true,
        isActive: true,
        department: 'Computer Science',
      });
      console.log('Teacher created: teacher@eduguard.ai / Teacher@123');
    } else {
      teacher = teacherExists;
    }

    // Create counselor
    const counselorExists = await User.findOne({ where: { email: 'counselor@eduguard.ai' } });
    if (!counselorExists) {
      await User.create({
        name: 'Dr. Michael Chen',
        email: 'counselor@eduguard.ai',
        password: 'Counselor@123',
        role: 'counselor',
        isVerified: true,
        isActive: true,
        department: 'Student Affairs',
      });
      console.log('Counselor created: counselor@eduguard.ai / Counselor@123');
    }

    // Create sample students
    for (const studentData of sampleStudents) {
      let student = await Student.findOne({ where: { studentId: studentData.studentId } });
      const prediction = predictDropoutRisk(studentData);

      if (!student) {
        student = await Student.create({
          ...studentData,
          dropoutStatus: false,
          addedBy: teacher.id,
          riskLevel: prediction.riskLevel,
          riskScore: prediction.riskScore,
          predictionConfidence: prediction.confidence,
        });
      }

      const predictionExists = await Prediction.findOne({ where: { studentId: student.id } });
      if (!predictionExists) {
        await Prediction.create({
          studentId: student.id,
          predictedBy: teacher.id,
          riskLevel: prediction.riskLevel,
          riskScore: prediction.riskScore,
          confidence: prediction.confidence,
          factors: prediction.factors,
          recommendations: prediction.recommendations,
          inputData: studentData,
        });
      }
    }
    console.log(`${sampleStudents.length} sample students seeded`);
    console.log('\nSeeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
