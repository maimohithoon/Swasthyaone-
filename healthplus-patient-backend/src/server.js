import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 24) {
  console.error("Set JWT_SECRET in .env (at least 24 characters).");
  process.exit(1);
}

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",").map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "20kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    req.patient = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired or invalid." });
  }
}
const own = (table, id, patientId) =>
  db.prepare(`SELECT id FROM ${table} WHERE id = ? AND patient_id = ?`).get(id, patientId);

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "HealthPlus API" }));

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string")
    return res.status(400).json({ message: "Email and password are required." });

  const patient = db.prepare("SELECT id,name,email,password_hash FROM patients WHERE email = ?")
    .get(email.trim().toLowerCase());
  if (!patient || !bcrypt.compareSync(password, patient.password_hash))
    return res.status(401).json({ message: "Invalid email or password." });

  const token = jwt.sign({ patientId: patient.id }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, patient: { id: patient.id, name: patient.name, email: patient.email } });
});

app.use("/api", authenticate);

app.get("/api/me", (req, res) => {
  const patient = db.prepare("SELECT id,name,email FROM patients WHERE id = ?").get(req.patient.patientId);
  res.json(patient || {});
});

app.get("/api/dashboard", (req, res) => {
  const id = req.patient.patientId;
  const appointments = db.prepare(`SELECT id,doctor_name AS doctorName,specialty,
    appointment_date AS date,appointment_time AS time,status
    FROM appointments WHERE patient_id = ? ORDER BY appointment_date,appointment_time LIMIT 5`).all(id);
  const claims = db.prepare(`SELECT id,provider,claim_type AS claimType,amount,status,submitted_at AS submittedAt
    FROM claims WHERE patient_id = ? ORDER BY submitted_at DESC`).all(id);
  const records = db.prepare(`SELECT id,record_date AS date,record_type AS type,
    doctor_name AS doctorName,description FROM medical_records
    WHERE patient_id = ? ORDER BY record_date DESC LIMIT 5`).all(id);
  const prescriptions = db.prepare(`SELECT id,medicine,dosage,instructions,status,refill_date AS refillDate
    FROM prescriptions WHERE patient_id = ? ORDER BY id DESC`).all(id);
  const goals = db.prepare(`SELECT id,goal_key AS goalKey,goal_value AS goalValue,
    current_value AS currentValue,unit FROM health_goals WHERE patient_id = ?`).all(id);
  res.json({
    statistics: {
      appointments: db.prepare("SELECT COUNT(*) n FROM appointments WHERE patient_id=?").get(id).n,
      claims: claims.length,
      approvedClaims: claims.filter(x => x.status === "Approved").length,
      pendingClaims: claims.filter(x => x.status === "Pending").length,
      medicalRecords: db.prepare("SELECT COUNT(*) n FROM medical_records WHERE patient_id=?").get(id).n,
      activePrescriptions: prescriptions.filter(x => x.status === "Active").length
    },
    appointments, claims, records, prescriptions, goals
  });
});

app.get("/api/appointments", (req, res) => {
  res.json(db.prepare(`SELECT id,doctor_name AS doctorName,specialty,
    appointment_date AS date,appointment_time AS time,status FROM appointments
    WHERE patient_id=? ORDER BY appointment_date,appointment_time`).all(req.patient.patientId));
});

app.post("/api/appointments", (req, res) => {
  const { doctorName, specialty, date, time } = req.body || {};
  if (![doctorName,specialty,date,time].every(v => typeof v === "string" && v.trim()))
    return res.status(400).json({ message: "Doctor, specialty, date and time are required." });
  const result = db.prepare(`INSERT INTO appointments
    (patient_id,doctor_name,specialty,appointment_date,appointment_time,status)
    VALUES (?,?,?,?,?,'Pending')`).run(req.patient.patientId, doctorName.trim(), specialty.trim(), date, time);
  res.status(201).json({ id: Number(result.lastInsertRowid), message: "Appointment request created." });
});

app.get("/api/claims", (req, res) => {
  res.json(db.prepare(`SELECT id,provider,claim_type AS claimType,amount,status,submitted_at AS submittedAt
    FROM claims WHERE patient_id=? ORDER BY submitted_at DESC`).all(req.patient.patientId));
});

app.post("/api/claims", (req, res) => {
  const { provider, claimType, amount } = req.body || {};
  if (typeof provider !== "string" || typeof claimType !== "string" ||
      !Number.isFinite(Number(amount)) || Number(amount) <= 0)
    return res.status(400).json({ message: "Valid provider, claim type and positive amount are required." });
  const result = db.prepare(`INSERT INTO claims (patient_id,provider,claim_type,amount,status)
    VALUES (?,?,?,?, 'Pending')`).run(req.patient.patientId, provider.trim(), claimType.trim(), Number(amount));
  res.status(201).json({ id: Number(result.lastInsertRowid), status: "Pending" });
});

app.get("/api/medical-records", (req, res) => {
  res.json(db.prepare(`SELECT id,record_date AS date,record_type AS type,
    doctor_name AS doctorName,description FROM medical_records
    WHERE patient_id=? ORDER BY record_date DESC`).all(req.patient.patientId));
});

app.get("/api/prescriptions", (req, res) => {
  res.json(db.prepare(`SELECT id,medicine,dosage,instructions,status,refill_date AS refillDate
    FROM prescriptions WHERE patient_id=? ORDER BY id DESC`).all(req.patient.patientId));
});

app.get("/api/health-goals", (req, res) => {
  res.json(db.prepare(`SELECT id,goal_key AS goalKey,goal_value AS goalValue,
    current_value AS currentValue,unit FROM health_goals WHERE patient_id=?`).all(req.patient.patientId));
});

app.patch("/api/health-goals/:id", (req, res) => {
  const id = Number(req.params.id);
  const { currentValue } = req.body || {};
  if (!Number.isInteger(id) || !Number.isFinite(Number(currentValue)) || Number(currentValue) < 0)
    return res.status(400).json({ message: "A valid goal ID and non-negative currentValue are required." });
  if (!own("health_goals", id, req.patient.patientId))
    return res.status(404).json({ message: "Goal not found." });
  db.prepare("UPDATE health_goals SET current_value=? WHERE id=? AND patient_id=?")
    .run(Number(currentValue), id, req.patient.patientId);
  res.json({ message: "Goal updated." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(PORT, () => console.log(`HealthPlus API running at http://localhost:${PORT}`));
