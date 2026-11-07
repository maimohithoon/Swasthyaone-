# HealthPlus Patient Dashboard Backend

A starter REST API for the HealthPlus patient dashboard using Node.js, Express and SQLite.

## 1. Requirements
- Node.js 20 or newer
- npm

## 2. Setup
Open this folder in VS Code and run:

```bash
npm install
```

Copy `.env.example` to `.env`, then set a long random `JWT_SECRET`.
For local Vite development, `CLIENT_ORIGIN=http://localhost:5173` is the default.

Start the API:

```bash
npm run dev
```

API base URL: `http://localhost:5000`

## 3. Demo login
The database seeds a demo patient on first run:

- Email: `ananya@example.com`
- Password: `Patient123!`

These credentials are for local demonstration only. Change/remove them before deployment.

## 4. Endpoints

Public:
- `GET /api/health`
- `POST /api/auth/login` with `{ "email": "...", "password": "..." }`

All other routes require `Authorization: Bearer <token>`:
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/claims`
- `POST /api/claims`
- `GET /api/medical-records`
- `GET /api/prescriptions`
- `GET /api/health-goals`
- `PATCH /api/health-goals/:id` with `{ "currentValue": 7500 }`

## 5. Connect from React

```js
const API = "http://localhost:5000/api";

const loginRes = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "ananya@example.com",
    password: "Patient123!"
  })
});
const loginData = await loginRes.json();

// Keep the token in memory where practical; avoid exposing it in URLs.
const dashboardRes = await fetch(`${API}/dashboard`, {
  headers: { Authorization: `Bearer ${loginData.token}` }
});
const dashboard = await dashboardRes.json();
console.log(dashboard);
```

## Important safety and production notes
- This project contains synthetic demo data, not real patient data.
- It is a learning prototype, not a production-ready medical system.
- Before handling real health information, obtain a professional security/privacy review,
  add HTTPS, secure session/token handling, audit logging, backups, access controls,
  consent and retention policies, and applicable legal/regulatory compliance.
- Do not upload real medical reports or personal health information to this demo.
- The example prescription entries are placeholders, not medical advice.


## SwasthyaOne frontend integration
Set the frontend environment variable `VITE_API_URL` to the backend origin (for example,
`http://localhost:5000`; do not append `/api`). Set backend `CLIENT_ORIGIN` to the
frontend origin. Multiple exact origins can be comma-separated.

The React app now authenticates patient logins against `POST /api/auth/login`, loads
appointments, claims and prescriptions from `/api/dashboard`, and submits new
appointments and claims to the API. The demo patient credentials are:
`ananya@example.com` / `Patient123!`.

The API starter currently has no signup endpoint, so signup is intentionally blocked
in the connected frontend. The demo account is seeded on first backend startup.
