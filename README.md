# 🎯 FocusMate AI — Daily Goal Planner with AI Task Breakdown

A MERN stack productivity app where you set a daily goal, and AI automatically breaks it into hourly tasks. At end of day, get a personalized AI reflection on your progress.

## ✨ Features
- Set daily goals with mood tracking
- AI auto-generates hourly task breakdown (Gemini AI)
- Check off tasks with live progress tracking
- AI end-of-day reflection and encouragement
- Date navigation to view past/future days
- JWT authentication

## 🛠️ Tech Stack
- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **AI:** Google Gemini API

---

## 🚀 Local Setup

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/focusmate-ai.git
cd focusmate-ai

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Set up environment variables

```bash
cd server
cp .env.example .env
# Now open .env and fill in your values:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=any_random_long_string
# GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run locally

Open two terminals:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

App runs at http://localhost:3000

---

## 🌐 Deployment

### Backend → Render.com (Free)

1. Go to https://render.com → Sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Add Environment Variables (same as .env):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `CLIENT_URL` → your Vercel frontend URL (add after deploying frontend)
6. Click **Deploy**
7. Copy your Render URL e.g. `https://focusmate-ai.onrender.com`

### Frontend → Vercel (Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project** → Import your repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework:** Create React App
4. Add Environment Variable:
   - No env vars needed — proxy handles it locally
   - BUT for production: in `client/src` replace `"/api/..."` with your Render URL
   - Easier fix: create `client/.env.production`:
     ```
     REACT_APP_API_URL=https://your-render-url.onrender.com
     ```
   - Then in all axios calls replace `"/api/..."` with `${process.env.REACT_APP_API_URL}/api/...`
5. Click **Deploy**

### Final step
After both are deployed:
- Go back to Render → Environment Variables
- Update `CLIENT_URL` to your Vercel URL
- Redeploy

---

## 📁 Project Structure

```
focusmate-ai/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── context/      # Auth context
│       ├── pages/        # Login, Register, Dashboard, GoalDetail
│       ├── App.js
│       └── index.css
└── server/               # Express backend
    ├── models/           # User, Goal
    ├── routes/           # auth, goals, ai
    ├── middleware/        # JWT auth
    └── index.js
```

## 👩‍💻 Built by Ananya — (MERN Stack + AI) Enthusiast
