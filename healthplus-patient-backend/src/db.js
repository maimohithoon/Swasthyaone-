import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const db = new Database(process.env.DATABASE_FILE || "./healthplus.sqlite");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed'
);
CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_date TEXT NOT NULL,
  record_type TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medicine TEXT NOT NULL,
  dosage TEXT NOT NULL,
  instructions TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  refill_date TEXT
);
CREATE TABLE IF NOT EXISTS health_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  goal_key TEXT NOT NULL,
  goal_value REAL NOT NULL,
  current_value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  UNIQUE(patient_id, goal_key)
);
`);

const count = db.prepare("SELECT COUNT(*) AS n FROM patients").get().n;
if (count === 0) {
  const passwordHash = bcrypt.hashSync("Patient123!", 10);
  const insertPatient = db.prepare(
    "INSERT INTO patients (name,email,password_hash) VALUES (?,?,?)"
  );
  const patientId = Number(insertPatient.run("Ananya Patel", "ananya@example.com", passwordHash).lastInsertRowid);

  const addAppointment = db.prepare(`INSERT INTO appointments
    (patient_id,doctor_name,specialty,appointment_date,appointment_time,status) VALUES (?,?,?,?,?,?)`);
  [
    ["Dr. Priya Sharma","General Physician","2026-11-12","10:00","Confirmed"],
    ["Dr. Rahul Mehta","Dermatologist","2026-11-18","14:30","Confirmed"],
    ["Dr. Sneha Kapoor","Gynecologist","2026-11-25","11:00","Scheduled"]
  ].forEach(x => addAppointment.run(patientId, ...x));

  const addClaim = db.prepare(`INSERT INTO claims
    (patient_id,provider,claim_type,amount,status) VALUES (?,?,?,?,?)`);
  [
    ["Care Secure","Consultation",1800,"Approved"],
    ["Care Secure","Lab tests",2500,"Pending"]
  ].forEach(x => addClaim.run(patientId, ...x));

  const addRecord = db.prepare(`INSERT INTO medical_records
    (patient_id,record_date,record_type,doctor_name,description) VALUES (?,?,?,?,?)`);
  [
    ["2026-11-03","Lab Report","Dr. Rakesh Verma","Blood test (CBC)"],
    ["2026-10-28","Consultation","Dr. Priya Sharma","General checkup"],
    ["2026-10-15","Lab Report","Dr. Meera Singh","Vitamin D test"]
  ].forEach(x => addRecord.run(patientId, ...x));

  const addPrescription = db.prepare(`INSERT INTO prescriptions
    (patient_id,medicine,dosage,instructions,status,refill_date) VALUES (?,?,?,?,?,?)`);
  [
    ["Example medicine A","As prescribed","Follow your clinician's instructions","Active","2026-11-15"],
    ["Example medicine B","As prescribed","Follow your clinician's instructions","Active","2026-11-20"]
  ].forEach(x => addPrescription.run(patientId, ...x));

  const addGoal = db.prepare(`INSERT INTO health_goals
    (patient_id,goal_key,goal_value,current_value,unit) VALUES (?,?,?,?,?)`);
  [
    ["steps",10000,7000,"steps"],
    ["water",8,5,"glasses"],
    ["sleep",8,6.5,"hours"]
  ].forEach(x => addGoal.run(patientId, ...x));
}

export default db;
