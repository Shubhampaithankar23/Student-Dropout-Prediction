const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"EduGuard AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your EduGuard AI Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E50914; font-size: 28px;">EduGuard AI</h1>
          <p style="color: #aaa;">Student Dropout Prediction System</p>
        </div>
        <h2 style="color: #fff;">Welcome, ${user.name}!</h2>
        <p style="color: #ccc;">Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #E50914; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #888; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset Your EduGuard AI Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E50914; font-size: 28px;">EduGuard AI</h1>
        </div>
        <h2 style="color: #fff;">Password Reset Request</h2>
        <p style="color: #ccc;">Hi ${user.name}, you requested a password reset.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #E50914; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendHighRiskAlert = async (counselor, student) => {
  await sendEmail({
    to: counselor.email,
    subject: `⚠️ High Risk Alert: ${student.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E50914; font-size: 28px;">EduGuard AI</h1>
          <div style="background: #E50914; color: #fff; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 10px;">⚠️ HIGH RISK ALERT</div>
        </div>
        <h2 style="color: #fff;">Immediate Attention Required</h2>
        <p style="color: #ccc;">Student <strong>${student.name}</strong> (ID: ${student.studentId}) has been identified as HIGH RISK for dropout.</p>
        <div style="background: rgba(229, 9, 20, 0.1); border: 1px solid #E50914; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #fff; margin: 0;"><strong>Risk Score:</strong> ${(student.riskScore * 100).toFixed(1)}%</p>
          <p style="color: #fff; margin: 8px 0;"><strong>CGPA:</strong> ${student.cgpa}</p>
          <p style="color: #fff; margin: 0;"><strong>Attendance:</strong> ${student.attendancePercentage}%</p>
        </div>
        <p style="color: #ccc;">Please schedule a counseling session as soon as possible.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/counseling" style="background: #E50914; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">View Student Profile</a>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendHighRiskAlert };
