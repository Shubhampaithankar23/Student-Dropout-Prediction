const User = require('./User');
const Student = require('./Student');
const Prediction = require('./Prediction');
const CounselingSession = require('./CounselingSession');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Associations
User.hasMany(Student, { foreignKey: 'addedBy', as: 'students' });
Student.belongsTo(User, { foreignKey: 'addedBy', as: 'teacher' });

Student.hasMany(Prediction, { foreignKey: 'studentId', as: 'predictions' });
Prediction.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

User.hasMany(Prediction, { foreignKey: 'predictedBy', as: 'predictions' });
Prediction.belongsTo(User, { foreignKey: 'predictedBy', as: 'predictor' });

Student.hasMany(CounselingSession, { foreignKey: 'studentId', as: 'counselingSessions' });
CounselingSession.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

User.hasMany(CounselingSession, { foreignKey: 'counselorId', as: 'counselingSessions' });
CounselingSession.belongsTo(User, { foreignKey: 'counselorId', as: 'counselor' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Student, Prediction, CounselingSession, Notification, AuditLog };
