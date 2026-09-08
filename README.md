# CivicSnap

CivicSnap is a modern municipal transparency and community issue resolution platform designed to empower citizens, eliminate bureaucratic delays, and accelerate neighborhood hazard remediation through photographic evidence and transparent resolution tracking.

---

## Key Features

- **Direct Citizen Reporting**: Submit public safety or infrastructure complaints with photo evidence, GPS location auto-detection, and priority tagging.
- **Guest Reporting Mode**: Report municipal issues in under a minute without mandatory prior registration.
- **Municipal Authority Portal**: Dedicated workflow for public works administrators to review reports, dispatch field squads, and certify repairs with official resolution remarks.
- **Real-Time Triage & Resolution Pipeline**: 4-stage tracking workflow (Reported -> Under Review -> In Progress -> Resolved) with visual progress indicators.
- **Citizen Endorsement & Sharing**: Community upvoting ("I also experience this") and instant tracking code clipboard sharing.
- **Authority CSV Export**: One-click data export for city planning and municipal squad dispatch.
- **Non-Blocking Toast System**: Modern notification toasts for user actions and feedback.
- **Dual Data Persistence**: Seamless support for MongoDB Express backend and Supabase cloud database with resilient offline fallback stores.

---

## Supported Civic Categories

1. Hazardous Potholes
2. Garbage & Waste Dumps
3. Illegal Parking
4. Streetlight Faults
5. Water & Pipeline Leaks
6. Public Infrastructure & Footpath Defects
7. Cleanliness & Street Sweeping
8. Open Waste Burning
9. Other Neighborhood Maintenance

---

## Project Structure

```
civicsnap/
├── backend/                  # Node.js & Express API
│   ├── models/               # Mongoose data schemas (Complaint, User)
│   ├── routes/               # API endpoints (/api/auth, /api/complaints)
│   ├── server.js             # Express server entry point
│   ├── render.yaml           # Render deployment configuration
│   └── package.json
├── public/                   # Static assets, branding & photography
│   ├── images/               # High-resolution civic photos
│   ├── favicon.svg           # Vector application favicon
│   └── logo.svg              # Vector CivicSnap brand mark
├── src/                      # React frontend
│   ├── components/           # UI components (CivicLogo, CreateComplaint, Toast, SplashScreen)
│   ├── lib/                  # Unified data access layer (Supabase & fallback store)
│   ├── pages/                # Pages (Landing, Dashboard, Login, Register)
│   ├── App.jsx               # Route definitions
│   └── main.jsx              # React DOM entry
├── index.html                # HTML entry template with typography links
├── vite.config.js            # Vite configuration
└── vercel.json               # Vercel deployment configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional, in-memory fallback enabled by default)

### 1. Frontend Setup
```bash
cd civicsnap
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

### 2. Backend Setup
```bash
cd civicsnap/backend
npm install
npm start
```
The API server will run on `http://localhost:5000`.

---

## Default Access Credentials

For testing and administrative evaluation:

- **Municipal Authority**: `admin@civicsnap.com` / `admin123`
- **Verified Citizen**: `user@civicsnap.com` / `password123`
- **Guest Citizen**: Accessible directly without sign-in via "Continue as Guest"

---

## Production Build

```bash
cd civicsnap
npm run build
```
Generates optimized static assets in `dist/` ready for CDN deployment on Vercel or any static host.
