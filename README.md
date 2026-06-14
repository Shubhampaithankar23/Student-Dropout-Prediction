# 🧠 EduGuard AI – Student Dropout Prediction System

**AI-Based Student Dropout Prediction and Preventive Counseling System**

> Built with React.js · Node.js · PostgreSQL · Machine Learning · JWT Auth

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- SQLite (included, default) or PostgreSQL 14+
- npm or yarn

---

## 📦 Installation

### 1. Clone / Open project
```
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai"
```

### 2. Setup Backend
```bash
cd backend
npm install
```

The included `.env` uses SQLite and works without additional database setup:
```
DB_DIALECT=sqlite
DB_STORAGE=./eduguard.db
```

To use PostgreSQL instead, edit `.env`:
```
DB_DIALECT=postgres
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/eduguard_db
```

Then create the PostgreSQL database:
```sql
CREATE DATABASE eduguard_db;
```

For either database, run migrations and seed data:
```bash
npm run migrate
npm run seed
```

Start backend server:
```bash
npm run dev
```
> Backend runs at: http://localhost:5000

---

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```
> Frontend runs at: http://localhost:3000

---

## 🔐 Demo Login Credentials

| Role      | Email                    | Password       |
|-----------|--------------------------|----------------|
| Admin     | admin@eduguard.ai        | Admin@123      |
| Teacher   | teacher@eduguard.ai      | Teacher@123    |
| Counselor | counselor@eduguard.ai    | Counselor@123  |

---

## 🏗️ Project Structure

```
eduguard-ai/
├── backend/
│   ├── src/
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── utils/            # JWT, email, ML predictor
│   │   └── database/         # Connection, migrations, seeds
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── public/       # Landing page
    │   │   ├── auth/         # Login, Register, etc.
    │   │   └── dashboard/    # All dashboard pages
    │   ├── components/
    │   │   └── layout/       # Sidebar, Topbar, Layout
    │   ├── store/            # Redux slices
    │   ├── services/         # Axios API service
    │   └── App.js
    └── .env
```

---

## 🧩 Features

### 🤖 AI Prediction Engine
- Random Forest Classifier (simulated in JS, connect Python ML in production)
- 12+ student parameters analyzed
- Risk levels: Low / Medium / High
- Confidence scoring
- Factor analysis & AI recommendations

### 👥 Role-Based Access
- **Admin**: Full system control, user management, all analytics
- **Teacher**: Add students, CSV upload, view predictions
- **Counselor**: View at-risk students, schedule sessions, track interventions

### 📊 Analytics
- Interactive charts (Recharts)
- Risk trend over time
- Gender/Financial/Department distribution
- Performance radar charts

### 📄 Reports
- Excel export (ExcelJS) – color-coded risk levels
- PDF export (PDFKit) – formatted institutional report

### 🔔 Notifications
- Real-time dashboard notifications
- Auto email alerts to counselors for high-risk students
- Notification center with read/unread tracking

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Redux Toolkit, Recharts   |
| Styling    | Custom CSS (glassmorphism + dark)   |
| Backend    | Node.js, Express.js                 |
| Database   | PostgreSQL + Sequelize ORM          |
| Auth       | JWT (access + refresh tokens)       |
| Email      | Nodemailer                          |
| AI/ML      | Random Forest (JS) / Python-ready   |
| Reports    | ExcelJS + PDFKit                    |

---

## 🗄️ Database Schema

```
users          → id, name, email, password, role, isVerified, isActive
students       → id, studentId, name, email, age, gender, cgpa, attendance, ...
predictions    → id, studentId, riskLevel, riskScore, confidence, factors, recommendations
counseling_sessions → id, studentId, counselorId, sessionDate, status, notes
notifications  → id, userId, title, message, type, isRead
audit_logs     → id, userId, action, resource, details, ipAddress
```

---

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/students
POST   /api/students
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id
POST   /api/students/upload/csv

POST   /api/predictions/predict/:studentId
GET    /api/predictions/history

GET    /api/analytics/overview
GET    /api/analytics/trends
GET    /api/analytics/performance

GET    /api/counseling
POST   /api/counseling
GET    /api/counseling/at-risk

GET    /api/reports/students/excel
GET    /api/reports/students/pdf

GET    /api/dashboard/stats
GET    /api/notifications
PATCH  /api/notifications/:id/read
```

---

## 🔒 Security Features
- JWT access + refresh tokens
- bcrypt password hashing (10 rounds)
- Role-based middleware
- Rate limiting (200 req/15min)
- CORS protection
- Input validation (express-validator)
- Audit logging
- Helmet.js security headers

---

## 📧 Email Setup (Gmail)
1. Enable 2FA on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Set in `.env`: `EMAIL_USER` and `EMAIL_PASS`

---

## 🚀 Production Deployment

### Backend (Railway / Render / VPS)
```bash
NODE_ENV=production
DATABASE_URL=<your_production_db_url>
JWT_SECRET=<strong_random_secret>
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the /build folder
REACT_APP_API_URL=https://your-backend.com/api
```

---

## 📝 CSV Upload Format

```csv
studentId,name,email,age,gender,department,semester,attendancePercentage,cgpa,assignmentSubmissionRate,lmsActivityScore,internalMarks,backlogs,participationScore,financialStatus
STU001,John Doe,john@example.com,20,Male,Computer Science,4,85,7.8,90,75,78,0,80,Good
```

---

*Built with ❤️ for Education · EduGuard AI © 2024*
