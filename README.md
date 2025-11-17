🏨 HotelEase — Complete Documentation

HotelEase is a modern, full-stack hotel operations management system built with:

React + TypeScript (Frontend)

Node.js + Express (Backend)

PostgreSQL + Prisma ORM (Database)

Google OAuth 2.0 Authentication

Motion Animations + Tailwind UI

Role-based Admin Dashboard

This README will guide you through the setup, installation, Google login configuration, database connection, and the entire workflow.

📁 Project Structure
HotelEase/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/passport.js
│   │   ├── routes/
│   │   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   └── App.tsx
    └── .env

⚙️ 1. Install Global Tools

Before starting, ensure you have:

✔ Node.js v18+
✔ PostgreSQL
✔ Git
✔ A Google Cloud account
🛠️ 2. Clone the Project
git clone https://github.com/yourusername/HotelEase.git
cd HotelEase

🗄️ 3. PostgreSQL Setup

Open pgAdmin or your SQL terminal

Create a new database:

CREATE DATABASE hotelease;


Note your DB credentials:

Key	Value Example
host	localhost
port	5432
database	hotelease
user	postgres
password	your_password
🧩 4. Backend Environment Setup

Go to:

cd backend


Create .env:

# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotelease?schema=public"

# Server
PORT=5000
NODE_ENV=development

# Allowed Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=hotelease-secret-key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

🔑 5. Google OAuth Setup
Step-by-Step:

Visit:
https://console.cloud.google.com

Create a new project → HotelEase

Navigate to:

APIs & Services → Credentials → Create OAuth Client ID


Select:

Application Type: Web Application


Add Authorized URIs:

Authorized JavaScript origins
http://localhost:3000

Authorized redirect URIs
http://localhost:5000/api/auth/google/callback


Copy your:

Google Client ID

Google Client Secret

Paste them into backend /.env

🔧 6. Prisma Setup

Still inside /backend:

Install dependencies:

npm install


Generate Prisma Client:

npx prisma generate


Push database schema:

npx prisma db push

🚀 7. Start Backend Server
npm run dev


If everything is correct, you'll see:

🚀 HotelEase API server running on port 5000
📡 Health check: http://localhost:5000/health

🖥️ 8. Frontend Setup

Open a second terminal:

cd frontend
npm install


Create .env:

VITE_API_URL=http://localhost:5000

▶️ 9. Run Frontend
npm run dev


Frontend will start at:

http://localhost:3000

🔐 10. Google Authentication Flow
User clicks → "Login with Google"

→ Redirects to Google
→ User selects an account
→ Google sends user back to:

http://localhost:5000/api/auth/google/callback


→ Backend verifies
→ Session created
→ Redirected to:

http://localhost:3000/dashboard


Then frontend checks:

window.location.pathname === "/dashboard"


→ Shows Admin Dashboard
→ Loads user info from:

GET /api/auth/user

📌 11. Important Backend Routes
Method	Route	Description
GET	/api/auth/google	Start Google login
GET	/api/auth/google/callback	OAuth redirect handler
GET	/api/auth/user	Returns logged-in user
GET	/api/auth/logout	Logs out user
👤 12. User Information Returned

Example response from /api/auth/user:

{
  "id": "116482519780076529911",
  "displayName": "Madhu Mayachar",
  "emails": [{ "value": "madhumayachar@gmail.com" }],
  "photos": [{ "value": "https://lh3.googleusercontent.com/..." }],
  "provider": "google"
}

🧠 13. Common Issues & Fixes
❌ Avatar shows broken image

✔ Use stable:

.replace("=s96-c", "=s256-c")

❌ Not logged in (401)

✔ Ensure backend CORS:

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


✔ Ensure Express session is above passport:

app.use(session({...}));
app.use(passport.initialize());
app.use(passport.session());

❌ Google redirect URI mismatch

✔ Re-check redirect URI:

http://localhost:5000/api/auth/google/callback

🚀 14. Future Enhancements

Staff Role Permissions

Multi-user Admin Management

Hotel Room Booking Engine

Inventory Tracking

Push Notifications

Mobile App Integration

Modern, elegant hotel management system with smooth animation and Google login.
