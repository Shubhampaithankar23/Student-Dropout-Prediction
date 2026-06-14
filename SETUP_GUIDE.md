# 🚀 EduGuard AI – Complete Setup Guide

## Step 1: Install Prerequisites

### 1.1 Install Node.js (REQUIRED)
Download and install from: https://nodejs.org/en/download
- Choose **LTS version** (v20 recommended)
- During install, check "Add to PATH"
- Restart your computer after installing

### 1.2 PostgreSQL (OPTIONAL)
The project runs with the included SQLite configuration by default. Install PostgreSQL only if you want to use it instead:
Download from: https://www.postgresql.org/download/windows/
- Default port: 5432
- Remember your **postgres** user password
- Open pgAdmin or psql and create database:
```sql
CREATE DATABASE eduguard_db;
```

---

## Step 2: Install Project Dependencies

Open **Command Prompt** or **PowerShell** and run:

```bash
# Install Backend
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai\backend"
npm install

# Install Frontend
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai\frontend"
npm install
```

---

## Step 3: Configure Environment

No environment changes are required for the default SQLite setup.

For PostgreSQL, edit `backend\.env`:
```
DB_DIALECT=postgres
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/eduguard_db
```
Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

---

## Step 4: Setup Database

```bash
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai\backend"
npm run migrate
npm run seed
```

---

## Step 5: Start the Application

**Terminal 1 – Backend:**
```bash
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai\backend"
npm run dev
```
> Backend starts at: http://localhost:5000

**Terminal 2 – Frontend:**
```bash
cd "C:\Users\sandi\OneDrive\Desktop\College\Ai dropout\eduguard-ai\frontend"
npm start
```
> Frontend opens automatically at: http://localhost:3000

---

## Step 6: Login

| Role      | Email                    | Password       |
|-----------|--------------------------|----------------|
| **Admin**     | admin@eduguard.ai    | Admin@123      |
| **Teacher**   | teacher@eduguard.ai  | Teacher@123    |
| **Counselor** | counselor@eduguard.ai| Counselor@123  |

---

## 📁 Sample CSV for Upload

Create a file `students.csv`:
```csv
studentId,name,email,age,gender,department,semester,attendancePercentage,cgpa,assignmentSubmissionRate,lmsActivityScore,internalMarks,backlogs,participationScore,financialStatus
STU100,Alice Smith,alice@test.com,20,Female,Computer Science,4,85,7.8,90,75,78,0,80,Good
STU101,Bob Jones,bob@test.com,21,Male,Electronics,5,45,4.2,35,20,38,4,25,Poor
STU102,Carol White,carol@test.com,19,Female,Mathematics,2,62,5.5,60,55,52,2,50,Average
```

---

## ❓ Troubleshooting

**"npm not recognized"**
→ Node.js not installed. Go to Step 1.

**"Database connection failed"**
→ Check PostgreSQL is running and password in `.env` is correct

**"Port 5000 already in use"**
→ Change `PORT=5001` in backend `.env`

**Frontend blank page**
→ Check browser console for errors. Make sure backend is running first.

---

## 🌐 Live Demo Deployment

### Deploy to Render.com (Free)
1. Push to GitHub
2. Create new Web Service on render.com
3. Set environment variables from `.env`
4. Deploy!

### Database on Supabase (Free PostgreSQL)
1. Create project at supabase.com
2. Copy connection string
3. Set as `DATABASE_URL` in Render env vars

---

*EduGuard AI v1.0.0 – AI-Based Student Dropout Prediction System*
