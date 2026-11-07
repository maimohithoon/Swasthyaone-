import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./healthapp.css";
import {
  triggerFileDownload,
  downloadPrescriptionPDF,
  downloadDiagnosticLabPDF,
  downloadAllPrescriptionsSummaryPDF,
  downloadAllLabsSummaryPDF,
  downloadRadiologyXRay,
  downloadReportOrScan,
  downloadMedicalRecord,
  downloadInsuranceDocument,
} from "./src/downloadService.js";

export const currencyRates = {
  INR: { code: "INR", symbol: "₹", name: "INR (₹)", rate: 1, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "USD ($)", rate: 1 / 83.5, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "EUR (€)", rate: 1 / 90.5, locale: "en-IE" },
  GBP: { code: "GBP", symbol: "£", name: "GBP (£)", rate: 1 / 106, locale: "en-GB" },
  AED: { code: "AED", symbol: "AED ", name: "AED (د.إ)", rate: 1 / 22.7, locale: "en-AE" },
};

export function formatMoney(amountInInr, cur = "INR") {
  const conf = currencyRates[cur] || currencyRates.INR;
  const converted = Math.round(Number(amountInInr || 0) * conf.rate);
  if (conf.code === "INR") {
    return `₹${Number(amountInInr || 0).toLocaleString("en-IN")}`;
  }
  return `${conf.symbol}${Number(converted).toLocaleString(conf.locale)}`;
}

const doctors = [
  { name: "Dr. Meera Kapoor", specialty: "Cardiologist", clinic: "Green Valley Clinic", fee: 800, avatar: "/doctor-meera.jpg", rating: "4.9", experience: "12+ yrs" },
  { name: "Dr. Rohan Verma", specialty: "Dermatologist", clinic: "City Care Centre", fee: 600, avatar: "/doctor-rohan.jpg", rating: "4.8", experience: "9+ yrs" },
  { name: "Dr. Aisha Khan", specialty: "General Physician", clinic: "WellSpring Health", fee: 500, avatar: "/doctor-aisha.jpg", rating: "4.9", experience: "10+ yrs" },
  { name: "Dr. Kabir Malhotra", specialty: "Orthopaedic", clinic: "Northside Medical", fee: 900, avatar: "/doctor-kabir.jpg", rating: "4.7", experience: "14+ yrs" },
];

export const DOCTOR_NAMES = [
  "Dr. Meera Kapoor",
  "Dr. Meena Kapoor",
  "Dr. Rohan Verma",
  "Dr. Aisha Khan",
  "Dr. Kabir Malhotra",
];

export function isDoctorUser(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim().toLowerCase();
  if (trimmed.startsWith("dr.") || trimmed.startsWith("dr ") || trimmed.startsWith("doctor")) {
    return true;
  }
  return DOCTOR_NAMES.some((doc) => doc.toLowerCase() === trimmed);
}

export const DOCTOR_PROFILES = {
  "Dr. Meera Kapoor": {
    name: "Dr. Meera Kapoor",
    specialty: "Cardiologist",
    department: "Cardiology & Internal Medicine",
    clinic: "Green Valley Clinic",
    avatar: "/doctor-meera.jpg",
    role: "Senior Consultant",
    greetingName: "Dr. Meera",
  },
  "Dr. Meena Kapoor": {
    name: "Dr. Meena Kapoor",
    specialty: "Cardiologist",
    department: "Cardiology & Internal Medicine",
    clinic: "Green Valley Clinic",
    avatar: "/doctor-meera.jpg",
    role: "Senior Consultant",
    greetingName: "Dr. Meena",
  },
  "Dr. Rohan Verma": {
    name: "Dr. Rohan Verma",
    specialty: "Dermatologist",
    department: "Dermatology",
    clinic: "City Care Centre",
    avatar: "/doctor-rohan.jpg",
    role: "Senior Dermatologist",
    greetingName: "Dr. Rohan",
  },
  "Dr. Aisha Khan": {
    name: "Dr. Aisha Khan",
    specialty: "General Physician",
    department: "General Medicine & Neurology",
    clinic: "WellSpring Health",
    avatar: "/doctor-aisha.jpg",
    role: "Specialist Physician",
    greetingName: "Dr. Aisha",
  },
  "Dr. Kabir Malhotra": {
    name: "Dr. Kabir Malhotra",
    specialty: "Orthopaedic Surgeon",
    department: "Orthopaedics & Joint Care",
    clinic: "Northside Medical",
    avatar: "/doctor-kabir.jpg",
    role: "Lead Orthopaedic",
    greetingName: "Dr. Kabir",
  },
};

export function getDoctorProfile(name) {
  if (DOCTOR_PROFILES[name]) return DOCTOR_PROFILES[name];
  const cleanName = (name || "Dr. Meera Kapoor").trim();
  const firstName = cleanName.split(" ")[1] || "Doctor";
  const isFemale = cleanName.toLowerCase().includes("meera") ||
                   cleanName.toLowerCase().includes("meena") ||
                   cleanName.toLowerCase().includes("aisha") ||
                   cleanName.toLowerCase().includes("priya") ||
                   cleanName.toLowerCase().includes("neha") ||
                   cleanName.toLowerCase().includes("sneha") ||
                   cleanName.toLowerCase().includes("pooja") ||
                   cleanName.toLowerCase().includes("ananya");
  return {
    name: cleanName,
    specialty: "Specialist Physician",
    department: "Healthcare Department",
    clinic: "SwasthyaOne Healthcare",
    avatar: isFemale ? "/doctor-meera.jpg" : "/doctor-rohan.jpg",
    role: "Senior Doctor",
    greetingName: `Dr. ${firstName}`,
  };
}

const initialAppointments = [
  {
    doctor: "Dr. Meera Kapoor",
    patient: "Aarav Sharma",
    date: "Today",
    time: "10:30 AM",
    status: "Confirmed",
    mode: "UPI (Google Pay)",
    reports: [
      {
        id: "rep-cbc-1",
        name: "CBC_Hemogram_Report.jpg",
        preview: "/swasthyaone-logo-icon.png",
        size: "1.4 MB",
        type: "Blood Test",
        date: "18 Oct 2026",
      },
      {
        id: "rep-xray-1",
        name: "Chest_XRay_Scan_PA.jpg",
        preview: "/chest-xray-scan.jpg",
        size: "2.1 MB",
        type: "Radiology Scan",
        date: "15 Oct 2026",
      },
    ],
  },
  {
    doctor: "Dr. Rohan Verma",
    patient: "Aarav Sharma",
    date: "22 Oct",
    time: "4:00 PM",
    status: "Upcoming",
    mode: "Credit Card",
    reports: [
      {
        id: "rep-lipid-1",
        name: "Lipid_Profile_Report.pdf",
        preview: "/swasthyaone-logo-icon.png",
        size: "950 KB",
        type: "Biochemistry",
        date: "12 Oct 2026",
      },
    ],
  },
];
const initialPayments = [
  { title: "Consultation Payment", amount: 800, mode: "UPI (Google Pay)", date: "Today", status: "Paid" },
  { title: "Lab Test Invoice", amount: 1200, mode: "Credit Card (Visa)", date: "Yesterday", status: "Paid" },
];
const initialClaims = [{ title: "Outpatient Consultation", amount: 800, status: "In Review" }];
const initialDocuments = ["Consultation Receipt.pdf", "Prescription Sample.pdf", "Insurance Policy Sample.pdf"];

export const initialPrescriptions = [
  {
    id: "rx-1",
    name: "Amoxicillin",
    dosage: "500 mg",
    type: "Capsule",
    category: "Antibiotic • Respiratory Infection",
    doctor: "Dr. Meera Kapoor",
    doctorSpec: "Cardiologist & Physician",
    frequency: "Twice daily (After meals)",
    schedule: "Morning (8:00 AM) • Night (8:00 PM)",
    startDate: "12 Oct 2026",
    endDate: "26 Oct 2026",
    daysLeft: 6,
    totalDays: 14,
    status: "Active",
    refillsLeft: 2,
    instructions: "Complete the full 14-day course. Take with full glass of water. Do not skip doses.",
    pharmacy: "Apollo Pharmacy, Bandra West",
  },
  {
    id: "rx-2",
    name: "Metformin Hydrochloride",
    dosage: "850 mg",
    type: "Tablet",
    category: "Anti-Diabetic • Glycemic Control",
    doctor: "Dr. Aisha Khan",
    doctorSpec: "General Physician",
    frequency: "Once daily (With dinner)",
    schedule: "Evening (8:30 PM)",
    startDate: "01 Sep 2026",
    endDate: "30 Nov 2026",
    daysLeft: 12,
    totalDays: 90,
    status: "Refill Due",
    refillsLeft: 1,
    instructions: "Monitor fasting blood glucose weekly. Swallow whole with meals.",
    pharmacy: "MedPlus Wellness, Sector 4",
  },
  {
    id: "rx-3",
    name: "Atorvastatin Calcium",
    dosage: "20 mg",
    type: "Tablet",
    category: "Cardiovascular • Lipid Lowering",
    doctor: "Dr. Rohan Verma",
    doctorSpec: "Cardiologist",
    frequency: "Once daily at bedtime",
    schedule: "Night (10:00 PM)",
    startDate: "15 Aug 2026",
    endDate: "15 Nov 2026",
    daysLeft: 25,
    totalDays: 90,
    status: "Active",
    refillsLeft: 3,
    instructions: "Take consistently at bedtime. Periodic lipid profile advised every 3 months.",
    pharmacy: "SwasthyaOne Direct Pharmacy",
  },
  {
    id: "rx-4",
    name: "Pantoprazole Gastro-Resistant",
    dosage: "40 mg",
    type: "Tablet",
    category: "Gastrointestinal • Acid Reducer",
    doctor: "Dr. Kabir Malhotra",
    doctorSpec: "Orthopaedic & Consultant",
    frequency: "Once daily (30 min before breakfast)",
    schedule: "Morning (7:30 AM)",
    startDate: "05 Oct 2026",
    endDate: "19 Oct 2026",
    daysLeft: 0,
    totalDays: 14,
    status: "Completed",
    refillsLeft: 0,
    instructions: "Take 30 minutes before first meal of the day with water.",
    pharmacy: "Wellness Forever 24x7",
  },
];

export const initialLabReports = [
  {
    id: "lab-1",
    testName: "Complete Blood Count (CBC) & Hemogram",
    category: "Hematology",
    labName: "Dr. Lal PathLabs & Diagnostics",
    doctor: "Dr. Meera Kapoor",
    date: "18 Oct 2026",
    sampleType: "Whole Blood (EDTA)",
    status: "Normal",
    turnaround: "Results Verified",
    summary: "All 18 hematology parameters within standard clinical limits. Hemoglobin robust at 14.2 g/dL.",
    fileSize: "1.4 MB",
    fileName: "CBC_Hemogram_Report_18Oct2026.pdf",
    metrics: [
      { name: "Hemoglobin", value: "14.2 g/dL", ref: "13.0 - 17.0 g/dL", status: "normal" },
      { name: "WBC Count", value: "6,800 /µL", ref: "4,000 - 11,000 /µL", status: "normal" },
      { name: "Platelet Count", value: "245,000 /µL", ref: "150,000 - 450,000 /µL", status: "normal" },
      { name: "RBC Count", value: "4.9 mil/µL", ref: "4.5 - 5.5 mil/µL", status: "normal" },
    ],
  },
  {
    id: "lab-2",
    testName: "Comprehensive Lipid Profile",
    category: "Biochemistry",
    labName: "Apollo Diagnostics Centre",
    doctor: "Dr. Rohan Verma",
    date: "12 Oct 2026",
    sampleType: "Serum (12 hr Fasting)",
    status: "Normal",
    turnaround: "Results Verified",
    summary: "Total cholesterol and triglycerides are in the desirable range under active dietary guidance.",
    fileSize: "980 KB",
    fileName: "Lipid_Profile_Report_12Oct2026.pdf",
    metrics: [
      { name: "Total Cholesterol", value: "185 mg/dL", ref: "< 200 mg/dL", status: "normal" },
      { name: "HDL (Good)", value: "52 mg/dL", ref: "> 40 mg/dL", status: "normal" },
      { name: "LDL (Bad)", value: "108 mg/dL", ref: "< 100 mg/dL", status: "borderline" },
      { name: "Triglycerides", value: "138 mg/dL", ref: "< 150 mg/dL", status: "normal" },
    ],
  },
  {
    id: "lab-3",
    testName: "HbA1c & Fasting Plasma Glucose (FPG)",
    category: "Diabetology",
    labName: "Metropolis Healthcare",
    doctor: "Dr. Aisha Khan",
    date: "04 Oct 2026",
    sampleType: "Fluoride Blood & Serum",
    status: "Normal",
    turnaround: "Results Verified",
    summary: "Glycated hemoglobin indicates excellent 3-month glycemic control (5.7%).",
    fileSize: "1.1 MB",
    fileName: "HbA1c_Fasting_Glucose_04Oct2026.pdf",
    metrics: [
      { name: "HbA1c (Glycated Hb)", value: "5.7 %", ref: "< 5.7 % Normal", status: "normal" },
      { name: "Fasting Glucose", value: "94 mg/dL", ref: "70 - 99 mg/dL", status: "normal" },
      { name: "Estimated Avg Glucose", value: "117 mg/dL", ref: "< 126 mg/dL", status: "normal" },
    ],
  },
  {
    id: "lab-4",
    testName: "Vitamin D3 (25-OH) & Vitamin B12",
    category: "Vitamins",
    labName: "SwasthyaOne Clinical Lab",
    doctor: "Dr. Kabir Malhotra",
    date: "25 Sep 2026",
    sampleType: "Serum",
    status: "Attention",
    turnaround: "Results Verified",
    summary: "Serum 25-OH Vitamin D is insufficient (21.4 ng/mL). Supplementation recommended.",
    fileSize: "850 KB",
    fileName: "Vitamin_D3_B12_Panel_Sep2026.pdf",
    metrics: [
      { name: "25-OH Vitamin D", value: "21.4 ng/mL", ref: "30 - 100 ng/mL", status: "low" },
      { name: "Vitamin B12", value: "480 pg/mL", ref: "211 - 911 pg/mL", status: "normal" },
      { name: "Calcium (Serum)", value: "9.3 mg/dL", ref: "8.8 - 10.2 mg/dL", status: "normal" },
    ],
  },
  {
    id: "lab-5",
    testName: "Thyroid Profile Total (T3, T4, TSH)",
    category: "Endocrinology",
    labName: "Max Healthcare Labs",
    doctor: "Dr. Meera Kapoor",
    date: "14 Sep 2026",
    sampleType: "Serum",
    status: "Normal",
    turnaround: "Results Verified",
    summary: "Euthyroid state confirmed. TSH is steady within the therapeutic reference bracket.",
    fileSize: "1.2 MB",
    fileName: "Thyroid_Panel_Report_Sep2026.pdf",
    metrics: [
      { name: "TSH (Ultrasensitive)", value: "2.14 µIU/mL", ref: "0.35 - 4.94 µIU/mL", status: "normal" },
      { name: "Total T3", value: "1.18 ng/mL", ref: "0.80 - 2.00 ng/mL", status: "normal" },
      { name: "Total T4", value: "8.4 µg/dL", ref: "5.1 - 14.1 µg/dL", status: "normal" },
    ],
  },
  {
    id: "lab-6",
    testName: "Digital Chest X-Ray (PA View)",
    category: "Radiology",
    labName: "Apollo Imaging & Diagnostics",
    doctor: "Dr. Kabir Malhotra",
    date: "02 Sep 2026",
    sampleType: "Radiology Digital Imaging",
    status: "Normal",
    turnaround: "Radiologist Signed",
    summary: "Bilateral lung fields clear. Cardiac silhouette normal size. No active pulmonary consolidation.",
    fileSize: "3.2 MB",
    fileName: "Digital_Chest_XRay_PA_Sep2026.pdf",
    metrics: [
      { name: "Cardiothoracic Ratio", value: "< 0.50", ref: "< 0.50 Normal", status: "normal" },
      { name: "Costophrenic Angles", value: "Clear & Sharp", ref: "Sharp & Clear", status: "normal" },
      { name: "Bony Thorax", value: "Intact", ref: "Unremarkable", status: "normal" },
    ],
  },
];

function formatDate(dateValue) {
  if (!dateValue) return "";
  return new Date(`${dateValue}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function Brand({ landing = false }) {
  return (
    <div className={`brand ${landing ? "landing-brand" : ""}`}>
      <div className="brand-icon-themed">
        <img
          src="/swasthyaone-logo-icon.png"
          alt="SwasthyaOne Logo"
          className="brand-logo-img"
        />
      </div>
      <div>
        <h2>Swasthya<span>One</span></h2>
        <p>Healthcare For A Better Tomorrow</p>
      </div>
    </div>
  );
}

function SearchIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="search-svg-icon"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="searchRimGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00a896" />
          <stop offset="100%" stopColor="#1764d5" />
        </linearGradient>
        <linearGradient id="searchLensGrad" x1="4" y1="4" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ccfbf1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="searchHandleGrad" x1="14" y1="14" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00a896" />
          <stop offset="100%" stopColor="#1764d5" />
        </linearGradient>
      </defs>
      <circle cx="10.5" cy="10.5" r="7" fill="url(#searchLensGrad)" stroke="url(#searchRimGrad)" strokeWidth="2.5" />
      <path d="M7.5 7.5C8.3 6.7 9.4 6.2 10.6 6.2" stroke="#00a896" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="8" r="0.9" fill="#ffffff" />
      <path d="M15.5 15.5L21.5 21.5" stroke="url(#searchHandleGrad)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ThemeSwitch({ darkMode, onToggle }) {
  return (
    <button
      type="button"
      className={`theme-switch ${darkMode ? "active" : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-switch-track">
        <span className="theme-icon sun-icon" aria-hidden="true">☀️</span>
        <span className="theme-icon moon-icon" aria-hidden="true">🌙</span>
        <span className="theme-switch-thumb" aria-hidden="true">
          <span className="thumb-icon">{darkMode ? "🌙" : "☀️"}</span>
        </span>
      </span>
    </button>
  );
}

function LandingPage({
  onAuth,
  onDashboard,
  currency = "INR",
  onCurrencyChange,
  onAlert,
  onNavigate,
  onSearchDoctors,
  onGetStarted,
  onHomeClick,
}) {
  const [showContact, setShowContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    contact: "",
    subject: "General Inquiry",
    message: "",
  });

  const [isDoctorTalking, setIsDoctorTalking] = useState(false);
  const lastSpokenRef = useRef(0);
  const speechTimerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      const audio = new Audio("/doctor-voice.mp3");
      audio.preload = "auto";
      audioRef.current = audio;
    } catch {
      /* ignore audio preload errors */
    }
  }, []);

  const speakDoctorVoice = useCallback(() => {
    const now = Date.now();
    if (now - lastSpokenRef.current < 1600) return;
    lastSpokenRef.current = now;

    setIsDoctorTalking(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => {
      setIsDoctorTalking(false);
    }, 2800);

    // Primary: Play authentic, consistent natural neural voice audio
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (audioRef.current) {
                audioRef.current.onended = () => setIsDoctorTalking(false);
              }
            })
            .catch(() => {
              playSpeechSynthesis();
            });
          return;
        }
      } catch {
        /* fallback below */
      }
    }

    function playSpeechSynthesis() {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance("Lage sabka mann, jahan hai SwasthyaOne");
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          utterance.lang = "hi-IN";

          const voices = window.speechSynthesis.getVoices?.() || [];
          const preferredVoice = voices.find(
            (v) =>
              v.lang?.includes("hi") ||
              v.lang?.includes("IN") ||
              v.name?.toLowerCase().includes("india") ||
              v.name?.toLowerCase().includes("hindi")
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          utterance.onend = () => setIsDoctorTalking(false);
          utterance.onerror = () => setIsDoctorTalking(false);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis error:", err);
        }
      }
    }
  }, []);

  function handleContactSubmit(e) {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setShowContact(false);
      setContactForm({ name: "", contact: "", subject: "General Inquiry", message: "" });
      onAlert?.("Thank you! Your message has been sent. Our SwasthyaOne support team will reach out within 15 minutes.", "success");
    }, 1200);
  }

  return (
    <section className="landing-page">
      <div className="landing-topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span>Your Health, Our Priority</span>
            <span className="topbar-sep">•</span>
            <span>Open 7 Days a Week</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-currency-wrap">
              <span className="currency-globe-icon">🌐</span>
              <select
                className="topbar-currency-select"
                value={currency}
                onChange={(e) => onCurrencyChange?.(e.target.value)}
                aria-label="Select Currency"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
            <button
              type="button"
              className="topbar-link-btn"
              onClick={() => {
                if (onHomeClick) onHomeClick();
                else if (onDashboard) onDashboard("overview");
              }}
            >
              Patient Portal
            </button>
            <button
              type="button"
              className="topbar-link-btn"
              onClick={() => {
                if (onDashboard) onDashboard("appointments");
              }}
            >
              Book Appointment
            </button>
            <button type="button" className="topbar-link-btn" onClick={() => setShowContact(true)}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <header className="landing-nav">
        <Brand landing />
        <nav>
          <a
            href="/home"
            onClick={(e) => {
              e.preventDefault();
              if (onHomeClick) {
                onHomeClick();
              } else if (onDashboard) {
                onDashboard("overview");
              } else {
                onAlert?.("Please log in or sign up first to access the dashboard.", "info");
                if (onNavigate) onNavigate("/login", "overview");
                else onAuth?.("login", "home");
              }
            }}
          >
            Home
          </a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <button
            type="button"
            className="nav-dev-btn"
            onClick={() => {
              if (onNavigate) onNavigate("/developer");
            }}
            title="Meet the SwasthyaOne Developer Team"
          >
            <span className="dev-btn-icon">⚡</span> Developers
          </button>
        </nav>
        <div className="nav-buttons">
          <button className="login-btn" onClick={() => onNavigate ? onNavigate("/login") : onAuth("login")}>Login</button>
          <button className="start-btn" onClick={() => onNavigate ? onNavigate("/signup") : onAuth("signup")}>Sign Up</button>
          <button
            type="button"
            className="search-icon-btn"
            aria-label="Find Doctors"
            title="Search Doctors (Login required)"
            onClick={() => {
              if (onSearchDoctors) {
                onSearchDoctors();
              } else {
                onAlert?.("Please log in or sign up to find and book doctors.", "info");
                if (onNavigate) onNavigate("/login");
                else onAuth("login");
              }
            }}
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="hero-text">
          <span className="hero-badge">✦ India's AI-Powered Healthcare Saathi</span>
          <h1>Your Complete<br /><span>Healthcare Journey</span><br />in One Place</h1>
          <p>From patient onboarding to doctor booking, payments and insurance reimbursement — SwasthyaOne brings your
            healthcare journey together in one place.</p>
          <div className="hero-buttons">
            <button
              type="button"
              className="start-btn"
              onClick={() => {
                if (onGetStarted) {
                  onGetStarted();
                } else if (onAuth) {
                  onAuth("login", "home");
                  onAlert?.("Please log in to access your SwasthyaOne dashboard.", "info");
                } else if (onNavigate) {
                  onNavigate("/login");
                }
              }}
            >
              Get Started →
            </button>
            <button className="login-btn" onClick={() => onNavigate ? onNavigate("/login") : onAuth("login")}>Login</button>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-badge">
              <span className="hero-stat-icon">👤</span>
              <div className="hero-stat-info">
                <strong>15+</strong>
                <small>Expert Doctors</small>
              </div>
            </div>
            <div className="hero-stat-badge">
              <span className="hero-stat-icon">💚</span>
              <div className="hero-stat-info">
                <strong>1k+</strong>
                <small>Happy Patients</small>
              </div>
            </div>
            <div className="hero-stat-badge">
              <span className="hero-stat-icon">🩺</span>
              <div className="hero-stat-info">
                <strong>25+</strong>
                <small>Specialties</small>
              </div>
            </div>
          </div>

          <p className="trust-line">✓ Secure &nbsp; ✓ Fast &nbsp; ✓ AI-Powered</p>
        </div>

        <div className="hero-visual">
          <div
            className={`hero-doctor-card ${isDoctorTalking ? "is-talking" : ""}`}
            onMouseEnter={speakDoctorVoice}
            onClick={speakDoctorVoice}
            title="Hover or click to hear Dr. SwasthyaOne!"
          >
            {isDoctorTalking && (
              <div className="doctor-speech-bubble" role="status" aria-live="polite">
                <span className="speech-icon">🩺</span>
                <span className="speech-text">“Lage sabka mann, jahan hai SwasthyaOne”</span>
                <span className="speech-wave">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
                <span className="speech-arrow-border"></span>
                <span className="speech-arrow"></span>
              </div>
            )}
            <img src="/hero-doctor.jpg" alt="SwasthyaOne Healthcare Doctor" className="hero-doctor-img" />
            <div className="doctor-speak-hint">
              <span>{isDoctorTalking ? "🔊 Speaking..." : "🎙️ Hover to hear me"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="services-heading">
          <h2>Our Services</h2>
          <div className="services-underline"></div>
        </div>
        <div className="services-grid">
          <article className="service-card" onClick={() => onDashboard("overview")} style={{ cursor: "pointer" }}>
            <div className="feature-icon-container">
              <span className="feature-icon">👤</span>
            </div>
            <h3>Smart Onboarding</h3>
            <p>Simple patient registration and document management.</p>
            <span className="service-learn-more">Learn More →</span>
          </article>
          <article className="service-card" onClick={() => onDashboard("appointments")} style={{ cursor: "pointer" }}>
            <div className="feature-icon-container">
              <span className="feature-icon">📅</span>
            </div>
            <h3>Easy Doctor Booking</h3>
            <p>Find a specialist and book an appointment easily.</p>
            <span className="service-learn-more">Learn More →</span>
          </article>
          <article className="service-card" onClick={() => onDashboard("payments")} style={{ cursor: "pointer" }}>
            <div className="feature-icon-container">
              <span className="feature-icon">💳</span>
            </div>
            <h3>Seamless Payments</h3>
            <p>View payment information in one place.</p>
            <span className="service-learn-more">Learn More →</span>
          </article>
          <article className="service-card" onClick={() => onDashboard("insurance")} style={{ cursor: "pointer" }}>
            <div className="feature-icon-container">
              <span className="feature-icon">🛡️</span>
            </div>
            <h3>Insurance Reimbursement</h3>
            <p>Organize documents and track claim status.</p>
            <span className="service-learn-more">Learn More →</span>
          </article>
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="services-heading">
          <h2>Your Health. <span>Simplified.</span></h2>
          <div className="services-underline"></div>
        </div>
        <p className="how-flow-badge">Register → Book Doctor → Pay → Submit Claim → Track</p>
        <div className="landing-cards-row">
          <div className="bottom-card card-packages">
            <div className="card-text-col">
              <h4>Health Checkup Packages</h4>
              <p className="card-price-line">
                Starting From{" "}
                <strong className="price-tag">
                  {currency === "USD" ? "$0.9" : formatMoney(99, currency)}
                </strong>
              </p>
              <button type="button" className="card-action-btn outline" onClick={() => onDashboard("overview")}>
                View Packages
              </button>
            </div>
            <div className="card-popout-wrapper family-wrapper">
              <img src="/family-cutout.png" alt="Family Health Checkup" className="card-popout-img family-img" />
            </div>
          </div>

          <div className="bottom-card card-why">
            <div className="card-text-col">
              <h4>Why Choose Us?</h4>
              <ul className="why-list">
                <li><span className="check-circle">✓</span> Experienced Doctors</li>
                <li><span className="check-circle">✓</span> Modern Facilities</li>
                <li><span className="check-circle">✓</span> Patient First Approach</li>
                <li><span className="check-circle">✓</span> Affordable Pricing</li>
              </ul>
              <button type="button" className="card-action-btn outline" onClick={() => onDashboard("doctors")}>
                Learn More
              </button>
            </div>
            <div className="card-popout-wrapper notepad-wrapper">
              <img src="/notepad-cutout.png" alt="Doctor Checklist Notepad" className="card-popout-img notepad-img" />
            </div>
          </div>

          <div className="bottom-card card-care">
            <div className="card-text-col">
              <h4>Take Care of Yourself Today</h4>
              <p>Early diagnosis, better treatment, healthier life.</p>
              <button type="button" className="card-action-btn teal" onClick={() => onDashboard("appointments")}>
                Book Now
              </button>
            </div>
            <div className="card-popout-wrapper woman-wrapper">
              <img src="/woman-cutout.png" alt="Take Care of Yourself" className="card-popout-img woman-img" />
            </div>
          </div>

          <div className="bottom-card card-emergency">
            <div className="card-text-col">
              <h4>We're Here for You</h4>
              <div className="emergency-number">24/7</div>
              <p>Emergency Care You Can Trust.</p>
              <button type="button" className="card-action-btn outline" onClick={() => setShowContact(true)}>
                Get Help Now
              </button>
            </div>
            <div className="card-popout-wrapper ambulance-wrapper">
              <img src="/ambulance-cutout.png" alt="Emergency Ambulance" className="card-popout-img ambulance-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact Us Modal */}
      {showContact && (
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <div>
                <h3>Contact SwasthyaOne</h3>
                <p>We're here to help 24/7. Reach out anytime.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowContact(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="contact-modal-body">
              <div className="contact-info-panel">
                <div className="contact-info-item">
                  <span className="contact-icon">🚨</span>
                  <div>
                    <strong>Emergency Helpline (24/7)</strong>
                    <p>+91 1800-123-9999 / 108</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Appointment Desk</strong>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <span className="contact-icon">✉️</span>
                  <div>
                    <strong>Email Support</strong>
                    <p>care@swasthyaone.com</p>
                  </div>
                </div>
              </div>

              <div className="contact-form-wrap">
                {contactSuccess ? (
                  <div className="contact-success-banner">
                    ✓ Thank you! Your message has been sent successfully. Our team will contact you shortly.
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleContactSubmit}>
                    <h4>Send Us a Message</h4>
                    <label>
                      Your Name
                      <input
                        required
                        placeholder="Enter your full name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </label>
                    <label>
                      Phone Number or Email
                      <input
                        required
                        placeholder="e.g. 9876543210 or name@gmail.com"
                        value={contactForm.contact}
                        onChange={(e) => setContactForm({ ...contactForm, contact: e.target.value })}
                      />
                    </label>
                    <label>
                      Department / Query Type
                      <select
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Doctor Appointment">Doctor Appointment</option>
                        <option value="Billing & Payments">Billing & Payments</option>
                        <option value="Insurance Claim">Insurance Claim</option>
                        <option value="Emergency Care">Emergency Care</option>
                      </select>
                    </label>
                    <label>
                      Message
                      <textarea
                        rows={3}
                        required
                        placeholder="How can our healthcare team help you?"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </label>
                    <div className="contact-form-actions">
                      <button type="submit" className="start-btn">Send Message</button>
                      <button
                        type="button"
                        className="login-btn"
                        onClick={() => {
                          setShowContact(false);
                          onDashboard("appointments");
                        }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\\/$/, "") + "/api";
async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `API request failed (${response.status})`);
  return data;
}

function extractNameFromEmail(email) {
  if (!email || !email.includes("@")) return "";
  const localPart = email.split("@")[0];
  const cleaned = localPart.replace(/[0-9]/g, "").replace(/[._-]/g, " ").trim();
  if (!cleaned) return "";
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function AuthPage({
  mode,
  onSwitch,
  onBack,
  onSuccess,
  onAlert,
  currentName = "Aarav Sharma",
  redirectNotice = null,
}) {
  const [name, setName] = useState(currentName === "Aarav Sharma" ? "" : currentName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [faceStatus, setFaceStatus] = useState("Face verification.");
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    return () => {
      const video = document.querySelector("#faceVideo");
      const stream = video?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.querySelector("#faceVideo");
      if (video) {
        video.srcObject = stream;
        video.style.display = "block";
      }
      setCameraOn(true);
      setFaceStatus("Camera started. Face recognition in progress.");
    } catch {
      setFaceStatus("Camera permission was unavailable. You can still use the signup.");
    }
  }

  function submit(event) {
    event.preventDefault();
    setAuthError("");

    if (mode === "signup" && password !== confirm) {
      const err = "Passwords do not match!";
      setAuthError(err);
      onAlert?.(err, "error");
      return;
    }

    const resolvedName = name.trim() || extractNameFromEmail(email) || currentName || "Aarav Sharma";
    if (onAuthenticate) {
      if (mode === "signup") {
        const err = "Account creation is not enabled in this backend yet. Please use the demo patient login.";
        setAuthError(err); onAlert?.(err, "error"); return;
      }
      try {
        const result = await onAuthenticate(email, password);
        onSuccess(result.patient?.name || resolvedName, result.token);
      } catch (error) {
        setAuthError(error.message);
        onAlert?.(error.message, "error");
      }
      return;
    }
    const isTargetDoctor =
      isDoctorUser(resolvedName) ||
      isDoctorUser(name) ||
      (email && (email.toLowerCase().includes("doctor") || email.toLowerCase().startsWith("dr")));

    // Doctor Password Verification: strictly requires Dr.12345
    if (isTargetDoctor) {
      if (password !== "Dr.12345") {
        const err = "Wrong or incorrect password! For all Dr. logins, password is Dr.12345";
        setAuthError(err);
        onAlert?.(err, "error");
        return;
      }
    }

    if (mode === "signup") {
      onAlert?.(`Sign up successful! Welcome, ${resolvedName}.`, "success");
    } else {
      onAlert?.(`Welcome back, ${resolvedName}! Logged in successfully.`, "success");
    }
    onSuccess(resolvedName);
  }

  function handleQuickDoctorLogin(selectedName) {
    setAuthError("");
    setName(selectedName);
    const emailPrefix = selectedName.toLowerCase().replace(/[^a-z0-9]/g, "");
    setEmail(`${emailPrefix}@swasthyaone.com`);
    
    if (isDoctorUser(selectedName)) {
      setPassword("Dr.12345");
      if (mode === "signup") {
        setConfirm("Dr.12345");
      }
      onAlert?.(`Welcome, ${selectedName}! Logged in with password Dr.12345.`, "success");
    } else {
      setPassword("Patient@123");
      if (mode === "signup") {
        setConfirm("Patient@123");
      }
      onAlert?.(`Welcome, ${selectedName}! Logged in successfully.`, "success");
    }
    onSuccess(selectedName);
  }

  return (
    <section className="auth-page">
      {/* Ambient Floating Glass Orbs */}
      <div className="glass-orb glass-orb-1" aria-hidden="true" />
      <div className="glass-orb glass-orb-2" aria-hidden="true" />
      <div className="glass-orb glass-orb-3" aria-hidden="true" />

      <div className="auth-card">
        <div className="glass-auth-header">
          <div className="glass-auth-icon">
            <span role="img" aria-label="medical-calendar">📅</span>
          </div>
          <div className="glass-auth-title-wrap">
            <h1>{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
            <p>
              {mode === "login"
                ? "Take the first step towards a healthier, brighter smile."
                : "Join SwasthyaOne for a personalized, seamless healthcare journey."}
            </p>
          </div>
        </div>

        {redirectNotice && (
          <div className="auth-redirect-notice">
            {redirectNotice}
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <div className="glass-input-wrap">
            <span className="glass-input-icon">👤</span>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAuthError("");
              }}
              placeholder={mode === "login" ? "Full Name (e.g. Dr. Meera Kapoor or Aarav Sharma)" : "Full Name"}
              required={mode === "signup"}
            />
          </div>

          <div className="glass-input-wrap">
            <span className="glass-input-icon">✉️</span>
            <input
              type="email"
              className="glass-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError("");
              }}
              placeholder="Email Address (you@gmail.com)"
              required
            />
          </div>

          <div className="glass-input-wrap">
            <span className="glass-input-icon">🔒</span>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError("");
              }}
              placeholder={
                isDoctorUser(name)
                  ? "Doctor password (Dr.12345)"
                  : mode === "login"
                  ? "Enter your password"
                  : "Create password (min 8 chars)"
              }
              minLength={mode === "signup" ? 8 : undefined}
              required
            />
          </div>

          {isDoctorUser(name) && (
            <div style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#00a896",
              marginTop: "-6px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span>🩺</span>
              <span>Doctor Portal Access: Required password is <strong>Dr.12345</strong></span>
            </div>
          )}

          {mode === "signup" && (
            <>
              <div className="glass-input-wrap">
                <span className="glass-input-icon">🔐</span>
                <input
                  type="password"
                  className="glass-input"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setAuthError("");
                  }}
                  placeholder={
                    isDoctorUser(name)
                      ? "Re-enter doctor password (Dr.12345)"
                      : "Re-enter password to confirm"
                  }
                  required
                />
              </div>

              <div className="face-verify-box">
                <h3>Face Verification</h3>
                <video id="faceVideo" autoPlay playsInline muted />
                <p role="status">{faceStatus}</p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button type="button" className="btn-light" onClick={startCamera}>
                    Start Camera
                  </button>
                  <button
                    type="button"
                    className="btn-light"
                    disabled={!cameraOn}
                    onClick={() => setFaceStatus("Verification complete. Biometric matching was performed.")}
                  >
                    Verify Face
                  </button>
                </div>
              </div>
            </>
          )}

          {authError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.14)",
              border: "1.5px solid rgba(239, 68, 68, 0.45)",
              color: "#ef4444",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "800",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>❌</span>
              <span>{authError}</span>
            </div>
          )}

          <button type="submit" className="glass-auth-submit">
            <span>{mode === "login" ? "Login Now" : "Create Account"}</span>
            <span className="glass-auth-arrow">→</span>
          </button>
        </form>

        {/* Quick Demo Doctor & Patient Logins */}
        <div className="auth-quick-doctors">
          <div className="auth-quick-title">Quick Logins (1-Click Switch):</div>
          <div className="auth-quick-chips">
            <button
              type="button"
              className="auth-quick-chip doctor"
              onClick={() => handleQuickDoctorLogin("Dr. Meera Kapoor")}
              title="Login as Dr. Meera Kapoor (Doctor Dashboard)"
            >
              🩺 Dr. Meera Kapoor
            </button>
            <button
              type="button"
              className="auth-quick-chip doctor"
              onClick={() => handleQuickDoctorLogin("Dr. Rohan Verma")}
              title="Login as Dr. Rohan Verma (Doctor Dashboard)"
            >
              🩺 Dr. Rohan Verma
            </button>
            <button
              type="button"
              className="auth-quick-chip doctor"
              onClick={() => handleQuickDoctorLogin("Dr. Aisha Khan")}
              title="Login as Dr. Aisha Khan (Doctor Dashboard)"
            >
              🩺 Dr. Aisha Khan
            </button>
            <button
              type="button"
              className="auth-quick-chip doctor"
              onClick={() => handleQuickDoctorLogin("Dr. Kabir Malhotra")}
              title="Login as Dr. Kabir Malhotra (Doctor Dashboard)"
            >
              🩺 Dr. Kabir Malhotra
            </button>
            <button
              type="button"
              className="auth-quick-chip patient"
              onClick={() => handleQuickDoctorLogin("Aarav Sharma")}
              title="Login as Aarav Sharma (Patient Dashboard)"
            >
              👤 Aarav Sharma (Patient)
            </button>
          </div>
        </div>

        <div className="glass-security-badge">
          <span className="glass-security-icon">🔒</span>
          <span>Your information is secure.</span>
        </div>

        <div className="auth-switch">
          <span>{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
          <button type="button" onClick={() => onSwitch(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </div>

        <button type="button" className="auth-back" onClick={onBack}>
          ← Back to home
        </button>
      </div>

      {/* Light Green Bottom Left Corner Back Button */}
      <button
        type="button"
        className="corner-back-btn"
        onClick={onBack}
        title="Go back to landing page"
      >
        <span className="corner-back-icon">←</span> Back
      </button>
    </section>
  );
}

function DeveloperPage({ onBack, onNavigate, onAlert }) {
  const [filterRole, setFilterRole] = useState("all");

  const developers = [
    {
      id: "frontend",
      name: "Chetanya",
      role: "Frontend Developer",
      badge: "Interactive UI & Client Architecture",
      avatarBg: "linear-gradient(135deg, #00a896 0%, #0284c7 100%)",
      avatarIcon: "💻",
      status: "Active Contributor",
      headline: "Crafting intuitive, accessible & responsive healthcare interfaces",
      bio: "Leads the frontend architecture of SwasthyaOne. Specialized in React 18 component design, dynamic biometrics, client-side routing, and real-time Web Speech audio integration.",
      techStack: [
        "React 18",
        "JavaScript (ES6+)",
        "Vite",
        "Modern CSS3",
        "Web Speech API",
        "Responsive UX",
        "Single-Page Routing",
      ],
      contributions: [
        "Voice-enabled doctor speech synthesis with live equalizer bars",
        "Interactive biometric profile modal with live BMI sliders",
        "Light-green bottom-left back navigation across application views",
        "Personalized time-based user greeting & persistent state sync",
      ],
      connectMsg: "Connected with Chetanya (Frontend Developer)! Feel free to discuss UI/UX, React architectures & animations.",
    },
    {
      id: "backend",
      name: "Daksh",
      role: "Backend Developer",
      badge: "Distributed Systems & Secure APIs",
      avatarBg: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
      avatarIcon: "⚙️",
      status: "Active Contributor",
      headline: "Architecting resilient healthcare microservices & secure pipelines",
      bio: "Constructs scalable, HIPAA-aligned healthcare backend services, appointment scheduling pipelines, multi-currency conversions, and encrypted medical records storage.",
      techStack: [
        "Node.js",
        "Express.js",
        "PostgreSQL",
        "REST & Fast API",
        "JWT Auth",
        "AES-256 Encryption",
        "Cloud Scalability",
      ],
      contributions: [
        "Secure patient authentication flows & session state guards",
        "Multi-currency financial billing engine (INR, USD, EUR, GBP, AED)",
        "Doctor availability indexing & appointment slot algorithms",
        "Automated insurance claim reimbursement tracking logic",
      ],
      connectMsg: "Connected with Daksh (Backend Developer)! Inquiries sent for API architecture, security & microservices.",
    },
    {
      id: "data-analyst",
      name: "Mohit",
      role: "Data Analyst",
      badge: "Health Informatics & Predictive Intelligence",
      avatarBg: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
      avatarIcon: "📊",
      status: "Active Contributor",
      headline: "Translating patient biometrics and healthcare trends into insights",
      bio: "Specializes in clinical health informatics, biometric metric modeling, and patient journey analytics. Developed the BMI classification algorithms and hospital demand forecasting.",
      techStack: [
        "Python (Pandas, NumPy)",
        "SQL Analytics",
        "Tableau / PowerBI",
        "Biometric Modeling",
        "Healthcare KPIs",
        "Statistical Forecasting",
      ],
      contributions: [
        "BMI health risk categorization and height/weight calibration models",
        "Predictive demand forecasting for specialist doctor appointments",
        "Insurance claim approval rate and turnaround time optimization",
        "Preventative health package uptake and clinical trend analytics",
      ],
      connectMsg: "Connected with Mohit (Data Analyst)! Inquiries sent for biometric modeling & healthcare informatics.",
    },
    {
      id: "ui-ux",
      name: "Shruti",
      role: "UI/UX Designer",
      badge: "Human-Centered Design & Accessibility",
      avatarBg: "linear-gradient(135deg, #ea580c 0%, #db2777 100%)",
      avatarIcon: "🎨",
      status: "Active Contributor",
      headline: "Creating empathetic, calming and accessible healthcare experiences",
      bio: "Shapes comforting, patient-first healthcare experiences. Designed the signature soothing white-and-green aesthetic, accessible high-contrast typography, and floating speech bubble interactions.",
      techStack: [
        "Figma & Canvas",
        "Design Systems",
        "User Journey Mapping",
        "Wireframing",
        "Prototyping",
        "WCAG 2.1 AA Accessibility",
      ],
      contributions: [
        "Signature calming white-and-green linear gradient visual identity",
        "Floating doctor speech bubble with pulsing audio equalizers",
        "Mobile-first patient onboarding and streamlined booking flows",
        "Accessibility-compliant high contrast typography and touch targets",
      ],
      connectMsg: "Connected with Shruti (UI/UX Designer)! Inquiries sent for design systems & user research.",
    },
  ];

  const visibleDevelopers =
    filterRole === "all" ? developers : developers.filter((d) => d.id === filterRole);

  return (
    <section className="developer-page">
      <header className="dev-nav">
        <div style={{ cursor: "pointer" }} onClick={() => (onNavigate ? onNavigate("/landing") : onBack())}>
          <Brand landing />
        </div>
        <div className="dev-nav-actions">
          <button
            type="button"
            className="dev-back-nav-btn"
            onClick={onBack}
            title="Return to landing page"
          >
            ← Back to Landing
          </button>
        </div>
      </header>

      <div className="dev-hero">
        <span className="dev-hero-badge">✦ SwasthyaOne Core Engineering Team</span>
        <h1>Meet the <span>Developers</span></h1>
        <p>
          Four specialized engineering disciplines collaborating seamlessly to build India's smartest,
          most accessible AI-powered healthcare journey.
        </p>

        <div className="dev-filter-bar">
          <button
            type="button"
            className={`dev-filter-pill ${filterRole === "all" ? "active" : ""}`}
            onClick={() => setFilterRole("all")}
          >
            🌟 All 4 Members
          </button>
          <button
            type="button"
            className={`dev-filter-pill ${filterRole === "frontend" ? "active" : ""}`}
            onClick={() => setFilterRole("frontend")}
          >
            💻 Chetanya (Frontend)
          </button>
          <button
            type="button"
            className={`dev-filter-pill ${filterRole === "backend" ? "active" : ""}`}
            onClick={() => setFilterRole("backend")}
          >
            ⚙️ Daksh (Backend)
          </button>
          <button
            type="button"
            className={`dev-filter-pill ${filterRole === "data-analyst" ? "active" : ""}`}
            onClick={() => setFilterRole("data-analyst")}
          >
            📊 Mohit (Data)
          </button>
          <button
            type="button"
            className={`dev-filter-pill ${filterRole === "ui-ux" ? "active" : ""}`}
            onClick={() => setFilterRole("ui-ux")}
          >
            🎨 Shruti (UI/UX)
          </button>
        </div>
      </div>

      <div className="dev-section">
        <div className="dev-grid">
          {visibleDevelopers.map((dev) => (
            <article key={dev.id} className="dev-card">
              <div>
                <div className="dev-card-top">
                  <div className="dev-avatar-wrapper">
                    <div className="dev-avatar-circle" style={{ background: dev.avatarBg }}>
                      {dev.avatarIcon}
                    </div>
                    <span className="dev-status-indicator" title={dev.status} />
                  </div>
                  <span className="dev-role-badge">{dev.role}</span>
                </div>

                <h3 className="dev-role-title">{dev.name}</h3>
                <div className="dev-role-sub">{dev.badge}</div>
                <p className="dev-bio">{dev.bio}</p>

                <div className="dev-subheading">Tech Stack & Tools</div>
                <div className="dev-tech-tags">
                  {dev.techStack.map((tech) => (
                    <span key={tech} className="dev-tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="dev-subheading">Key Contributions</div>
                <ul className="dev-tasks-list">
                  {dev.contributions.map((item, idx) => (
                    <li key={idx}>
                      <span className="dev-check-icon">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dev-card-footer">
                <button
                  type="button"
                  className="dev-connect-btn"
                  onClick={() => onAlert?.(dev.connectMsg, "success")}
                >
                  ⚡ Connect
                </button>
                <div className="dev-social-links">
                  <button
                    type="button"
                    className="dev-social-btn"
                    title={`View ${dev.name}'s GitHub Repository`}
                    onClick={() => onAlert?.(`Opening ${dev.name}'s (${dev.role}) code repository references.`, "info")}
                  >
                    📂
                  </button>
                  <button
                    type="button"
                    className="dev-social-btn"
                    title={`View ${dev.name}'s Profile`}
                    onClick={() => onAlert?.(`Opening ${dev.name}'s (${dev.role}) verified profile.`, "info")}
                  >
                    💼
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="dev-banner">
          <div className="dev-stat-item">
            <div className="dev-stat-num">4</div>
            <div className="dev-stat-label">Core Engineering Pillars</div>
          </div>
          <div className="dev-stat-item">
            <div className="dev-stat-num">100%</div>
            <div className="dev-stat-label">Responsive & Accessible</div>
          </div>
          <div className="dev-stat-item">
            <div className="dev-stat-num">0ms</div>
            <div className="dev-stat-label">Audio Speech Latency</div>
          </div>
          <div className="dev-stat-item">
            <div className="dev-stat-num">24/7</div>
            <div className="dev-stat-label">Continuous Health Uptime</div>
          </div>
        </div>
      </div>

      {/* Floating Light Green Back Button in Bottom Left Corner */}
      <button
        type="button"
        className="corner-back-btn"
        onClick={onBack}
        title="Go back to landing page"
      >
        <span className="corner-back-icon">←</span> Back
      </button>
    </section>
  );
}

function Row({ children }) {
  return <div className="row">{children}</div>;
}

function computeBmi(hCm, wKg) {
  const h = parseFloat(hCm);
  const w = parseFloat(wKg);
  if (!h || !w || h <= 0 || w <= 0) return "22.4";
  const hM = h / 100;
  const bmiVal = w / (hM * hM);
  return bmiVal.toFixed(1);
}

/* ==========================================================================
   DOCTOR / CLINIC DASHBOARD VIEW COMPONENT (SwasthyaOne Doctor Portal)
   ========================================================================== */
function DoctorDashboardView({
  onBack,
  darkMode,
  toggleTheme,
  userName = "Dr. Meera Kapoor",
  onUpdateUserName,
  onAlert,
  currency = "INR",
  onCurrencyChange,
  page = "overview",
  showPage,
  claims = [],
  appointments = [],
  documents = [],
}) {
  const doctor = useMemo(() => getDoctorProfile(userName), [userName]);
  const [calMonth, setCalMonth] = useState("October 2026");
  const [selectedDay, setSelectedDay] = useState(14);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPatientReport, setSelectedPatientReport] = useState(null);
  const [docAptFilter, setDocAptFilter] = useState("all");
  const [doctorNoteText, setDoctorNoteText] = useState("");

  const calDays = useMemo(() => [
    { day: 28, muted: true }, { day: 29, muted: true }, { day: 30, muted: true },
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14, active: true }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 },
    { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1, muted: true },
  ], []);

  const upcomingDoctorAppointments = useMemo(() => [
    {
      time: "10:00 AM",
      name: "Dr. Meera Kapoor",
      spec: "Cardiologist",
      status: "Confirmed",
      avatar: "/doctor-meera.jpg",
    },
    {
      time: "02:30 PM",
      name: "Dr. Rajesh Verma",
      spec: "Cardiologist",
      status: "Confirmed",
      avatar: "/doctor-rohan.jpg",
    },
    {
      time: "05:00 PM",
      name: "Dr. Neha Singh",
      spec: "General Physician",
      status: "Pending",
      avatar: "/doctor-aisha.jpg",
    },
  ], []);

  const liveDoctorAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return upcomingDoctorAppointments;
    return appointments.map((apt) => ({
      time: apt.time || "10:30 AM",
      date: apt.date || "Today",
      patient: apt.patient || "Aarav Sharma",
      name: apt.patient || "Aarav Sharma",
      doctor: apt.doctor,
      spec: getDoctorProfile(apt.doctor)?.specialty || "Clinical Consultation",
      status: apt.status || "Confirmed",
      mode: apt.mode || "Online Consultation",
      reports: apt.reports || [],
      insurancePaperName: apt.insurancePaperName,
      insurancePaperPreview: apt.insurancePaperPreview,
      avatar: getDoctorProfile(apt.doctor)?.avatar || "/doctor-meera.jpg",
    }));
  }, [appointments, upcomingDoctorAppointments]);

  const filteredDocAppointments = useMemo(() => {
    if (docAptFilter === "reports") {
      return liveDoctorAppointments.filter((a) => a.reports && a.reports.length > 0);
    }
    return liveDoctorAppointments;
  }, [liveDoctorAppointments, docAptFilter]);

  const recentPatientRecords = useMemo(() => [
    { name: "Ananya Patel", initials: "AP", ageGender: "32 / Female", visit: "Oct 12, 2026", condition: "Fever & Cold", status: "Active" },
    { name: "Rohan Mehta", initials: "RM", ageGender: "45 / Male", visit: "Oct 10, 2026", condition: "Diabetes", status: "Active" },
    { name: "Sneha Verma", initials: "SV", ageGender: "28 / Female", visit: "Oct 8, 2026", condition: "Skin Allergy", status: "Active" },
    { name: "Amit Gupta", initials: "AG", ageGender: "50 / Male", visit: "Oct 5, 2026", condition: "Hypertension", status: "Active" },
    { name: "Pooja Sharma", initials: "PS", ageGender: "36 / Female", visit: "Oct 3, 2026", condition: "Pregnancy Checkup", status: "Active" },
  ], []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onAlert?.(`Searching across doctor records for: "${searchQuery}"`, "info");
  };

  return (
    <div className={`doc-dash-shell ${darkMode ? "dark-mode" : ""}`}>
      <div className="doc-dash-layout">
        {/* Left Sidebar */}
        <aside className="doc-sidebar">
          <div>
            {/* SwasthyaOne Doctor Portal Brand */}
            <div className="doc-brand" onClick={() => showPage("overview")} role="button" tabIndex={0}>
              <div className="doc-brand-icon">
                <img
                  src="/swasthyaone-logo-icon.png"
                  alt="SwasthyaOne Logo"
                  className="brand-logo-img"
                />
              </div>
              <div>
                <div className="doc-brand-title">Swasthya<span>One</span></div>
                <div className="doc-brand-sub">Doctor & Clinical Portal</div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="doc-sidebar-nav">
              <button
                type="button"
                className={`doc-nav-item ${page === "overview" ? "active" : ""}`}
                onClick={() => showPage("overview")}
              >
                <span className="doc-nav-icon">🏠</span>
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "appointments" ? "active" : ""}`}
                onClick={() => showPage("appointments")}
              >
                <span className="doc-nav-icon">📅</span>
                <span>Appointments</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "patients" ? "active" : ""}`}
                onClick={() => showPage("patients")}
              >
                <span className="doc-nav-icon">👥</span>
                <span>Patients</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "insurance" ? "active" : ""}`}
                onClick={() => showPage("insurance")}
              >
                <span className="doc-nav-icon">🛡️</span>
                <span>Insurance Claims</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "documents" ? "active" : ""}`}
                onClick={() => showPage("documents")}
              >
                <span className="doc-nav-icon">📁</span>
                <span>Medical Records</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "doctors" ? "active" : ""}`}
                onClick={() => showPage("doctors")}
              >
                <span className="doc-nav-icon">🩺</span>
                <span>Doctors</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "prescriptions" ? "active" : ""}`}
                onClick={() => showPage("prescriptions")}
              >
                <span className="doc-nav-icon">💊</span>
                <span>Prescriptions</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "lab-reports" ? "active" : ""}`}
                onClick={() => showPage("lab-reports")}
              >
                <span className="doc-nav-icon">🧪</span>
                <span>Lab Reports</span>
              </button>
              <button
                type="button"
                className={`doc-nav-item ${page === "reports" ? "active" : ""}`}
                onClick={() => showPage("reports")}
              >
                <span className="doc-nav-icon">📊</span>
                <span>Reports</span>
              </button>
              <button
                type="button"
                className="doc-nav-item"
                onClick={() => onAlert?.("Doctor Portal Settings & Consultation Preferences", "info")}
              >
                <span className="doc-nav-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div>
            {/* Promo Card at bottom of sidebar */}
            <div className="doc-promo-card">
              <div className="doc-promo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="doc-promo-title">Better Care For A Healthier You</div>
              <div className="doc-promo-desc">
                Book appointments, manage claims and keep track of your health — all in one place.
              </div>
              <button
                type="button"
                className="doc-promo-btn"
                onClick={() => showPage("appointments")}
              >
                Learn More →
              </button>
            </div>

            {/* Doctor User Card at bottom of sidebar */}
            <div
              className="doc-user-pill"
              onClick={() => onAlert?.(`Doctor Profile: ${doctor.name} (${doctor.specialty})`, "info")}
              role="button"
              tabIndex={0}
              title="Click to view Doctor Profile"
            >
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="doc-user-avatar"
              />
              <div className="doc-user-info">
                <div className="doc-user-name">{doctor.name}</div>
                <div className="doc-user-role">{doctor.role || "Doctor"}</div>
              </div>
              <span style={{ opacity: 0.6, fontSize: "16px" }}>›</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="doc-main-wrap">
          {/* Header Bar */}
          <header className="doc-header">
            <form className="doc-search-box" onSubmit={handleSearchSubmit}>
              <span style={{ opacity: 0.6, fontSize: "14px" }}>🔍</span>
              <input
                type="text"
                className="doc-search-input"
                placeholder="Search doctors, patients, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="doc-header-actions">
              {/* Sign Out Button */}
              <button
                type="button"
                className="btn-light"
                onClick={onBack}
                title="Sign out of Doctor Portal"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>

              {/* Theme Toggle (Dark / Light) */}
              <button
                type="button"
                className="doc-theme-btn"
                onClick={toggleTheme}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                className="doc-bell-btn"
                onClick={() => onAlert?.("You have 3 patient appointment requests pending review.", "info")}
                title="Notifications"
                aria-label="Notifications"
              >
                🔔
                <span className="doc-bell-badge">3</span>
              </button>

              {/* Profile Chip */}
              <div
                className="doc-header-profile"
                onClick={() => onAlert?.(`Logged in as ${doctor.name} (${doctor.specialty})`, "info")}
              >
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="doc-header-avatar"
                />
                <div className="doc-header-text">
                  <div className="doc-header-name">{doctor.name}</div>
                  <div className="doc-header-role">{doctor.specialty}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Overview Tab Content */}
          {page === "overview" && (
            <main className="doc-content-area">
              {/* Hero Banner with Doctor */}
              <div className="doc-hero-banner">
                <div className="doc-hero-left">
                  <div className="doc-hero-greeting">
                    Good Morning, {doctor.greetingName || doctor.name} 👋
                  </div>
                  <h1 className="doc-hero-heading">
                    Take care of your health today for a better tomorrow
                  </h1>
                  <p className="doc-hero-desc">
                    Book an appointment, track your claims, and access your medical records — all in one place.
                  </p>
                  <button
                    type="button"
                    className="doc-hero-cta"
                    onClick={() => showPage("appointments")}
                  >
                    <span>Book Appointment</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="doc-hero-center">
                  <div className="doc-hero-backdrop-shape" />
                  <img
                    src={doctor.avatar || "/doctor-meera.jpg"}
                    alt={doctor.name}
                    className="doc-hero-doctor-img"
                  />
                </div>

                <div className="doc-hero-badges">
                  <div className="doc-hero-badge-item">
                    <span>🩺</span>
                    <span>Trusted Doctors</span>
                  </div>
                  <div className="doc-hero-badge-item">
                    <span>🛡️</span>
                    <span>Secure & Private</span>
                  </div>
                  <div className="doc-hero-badge-item">
                    <span>🕒</span>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="doc-stat-grid">
                <div
                  className="doc-stat-card stat-apts"
                  onClick={() => showPage("appointments")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-stat-icon-wrap blue">📅</div>
                  <div className="doc-stat-label">Total Appointments</div>
                  <div className="doc-stat-value">12</div>
                  <div className="doc-stat-trend">↑ 20% from last month</div>
                </div>

                <div
                  className="doc-stat-card stat-claims"
                  onClick={() => showPage("insurance")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-stat-icon-wrap teal">🛡️</div>
                  <div className="doc-stat-label">Insurance Claims</div>
                  <div className="doc-stat-value">5</div>
                  <div className="doc-stat-trend">↑ 67% from last month</div>
                </div>

                <div
                  className="doc-stat-card stat-patients"
                  onClick={() => showPage("patients")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-stat-icon-wrap sky">👥</div>
                  <div className="doc-stat-label">Patients Registered</div>
                  <div className="doc-stat-value">248</div>
                  <div className="doc-stat-trend">↑ 12% from last month</div>
                </div>

                <div
                  className="doc-stat-card stat-records"
                  onClick={() => showPage("documents")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-stat-icon-wrap purple">📄</div>
                  <div className="doc-stat-label">Medical Records</div>
                  <div className="doc-stat-value">36</div>
                  <div className="doc-stat-trend">↑ 18% from last month</div>
                </div>
              </div>

              {/* 2-Column Split Layout */}
              <div className="doc-split-grid">
                {/* Left Column Stack */}
                <div className="doc-left-stack">
                  {/* Subgrid 1: Line Chart + Donut Chart */}
                  <div className="doc-mid-subgrid">
                    {/* Health Overview Dual-Curve SVG Area Chart */}
                    <div className="doc-card card-health-overview">
                      <div className="doc-card-header">
                        <div>
                          <h3>Health Overview</h3>
                          <div className="doc-chart-subtitle">
                            Patient visits & claim status (Last 6 months)
                          </div>
                        </div>
                        <div className="doc-chart-legend">
                          <span>
                            <span className="doc-legend-dot apts"></span>Appointments
                          </span>
                          <span>
                            <span className="doc-legend-dot claims"></span>Claims
                          </span>
                        </div>
                      </div>

                      {/* Responsive SVG Chart */}
                      <div style={{ position: "relative", width: "100%", height: "200px" }}>
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 520 210"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="docBlueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="docTealAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00d2b4" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#00d2b4" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[180, 142.5, 105, 67.5, 30].map((y, idx) => (
                            <line
                              key={idx}
                              x1="45"
                              y1={y}
                              x2="495"
                              y2={y}
                              stroke={darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9"}
                              strokeDasharray={idx === 4 ? "0" : "4 4"}
                            />
                          ))}

                          {/* Y-axis Labels */}
                          <text x="35" y="34" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="end" fontWeight="700">40</text>
                          <text x="35" y="71.5" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="end" fontWeight="700">30</text>
                          <text x="35" y="109" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="end" fontWeight="700">20</text>
                          <text x="35" y="146.5" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="end" fontWeight="700">10</text>
                          <text x="35" y="184" fill={darkMode ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="end" fontWeight="700">0</text>

                          {/* Appointments Area & Curve */}
                          <path
                            d="M 50,123.75 C 92.5,123.75 92.5,112.5 135,112.5 C 177.5,112.5 177.5,127.5 220,127.5 C 262.5,127.5 262.5,90 305,90 C 347.5,90 347.5,75 390,75 C 432.5,75 432.5,60 475,60 L 475,180 L 50,180 Z"
                            fill="url(#docBlueAreaGrad)"
                          />
                          <path
                            d="M 50,123.75 C 92.5,123.75 92.5,112.5 135,112.5 C 177.5,112.5 177.5,127.5 220,127.5 C 262.5,127.5 262.5,90 305,90 C 347.5,90 347.5,75 390,75 C 432.5,75 432.5,60 475,60"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Claims Area & Curve */}
                          <path
                            d="M 50,150 C 92.5,150 92.5,135 135,135 C 177.5,135 177.5,142.5 220,142.5 C 262.5,142.5 262.5,112.5 305,112.5 C 347.5,112.5 347.5,52.5 390,52.5 C 432.5,52.5 432.5,97.5 475,97.5 L 475,180 L 50,180 Z"
                            fill="url(#docTealAreaGrad)"
                          />
                          <path
                            d="M 50,150 C 92.5,150 92.5,135 135,135 C 177.5,135 177.5,142.5 220,142.5 C 262.5,142.5 262.5,112.5 305,112.5 C 347.5,112.5 347.5,52.5 390,52.5 C 432.5,52.5 432.5,97.5 475,97.5"
                            fill="none"
                            stroke="#00d2b4"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Data Points */}
                          {[
                            { x: 50, yApt: 123.75, yClm: 150, m: "May", apt: 15, clm: 8 },
                            { x: 135, yApt: 112.5, yClm: 135, m: "Jun", apt: 18, clm: 12 },
                            { x: 220, yApt: 127.5, yClm: 142.5, m: "Jul", apt: 14, clm: 10 },
                            { x: 305, yApt: 90, yClm: 112.5, m: "Aug", apt: 24, clm: 18 },
                            { x: 390, yApt: 75, yClm: 52.5, m: "Sep", apt: 28, clm: 34 },
                            { x: 475, yApt: 60, yClm: 97.5, m: "Oct", apt: 32, clm: 22 },
                          ].map((pt, idx) => (
                            <g key={idx}>
                              {/* X labels */}
                              <text
                                x={pt.x}
                                y="202"
                                fill={darkMode ? "#8ba3c7" : "#64748b"}
                                fontSize="11"
                                fontWeight="700"
                                textAnchor="middle"
                              >
                                {pt.m}
                              </text>
                              {/* Appointments Point */}
                              <circle
                                cx={pt.x}
                                cy={pt.yApt}
                                r="4.5"
                                fill="#ffffff"
                                stroke="#2563eb"
                                strokeWidth="3"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={() => setHoveredPoint({ ...pt, type: "Apt", val: pt.apt, y: pt.yApt })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              {/* Claims Point */}
                              <circle
                                cx={pt.x}
                                cy={pt.yClm}
                                r="4.5"
                                fill="#ffffff"
                                stroke="#00d2b4"
                                strokeWidth="3"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={() => setHoveredPoint({ ...pt, type: "Clm", val: pt.clm, y: pt.yClm })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            </g>
                          ))}
                        </svg>

                        {/* Interactive Tooltip */}
                        {hoveredPoint && (
                          <div
                            style={{
                              position: "absolute",
                              left: `${(hoveredPoint.x / 520) * 100}%`,
                              top: `${(hoveredPoint.y / 210) * 100}%`,
                              transform: "translate(-50%, -130%)",
                              background: "#081325",
                              color: "#ffffff",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 800,
                              boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                              pointerEvents: "none",
                              zIndex: 10,
                              whiteSpace: "nowrap",
                              border: "1px solid rgba(255,255,255,0.15)",
                            }}
                          >
                            {hoveredPoint.m}: {hoveredPoint.type === "Apt" ? "Appointments" : "Claims"} ({hoveredPoint.val})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Insurance Claim Status Donut Card */}
                    <div className="doc-card card-claim-status">
                      <div className="doc-card-header">
                        <h3>Insurance Claim Status</h3>
                        <button
                          type="button"
                          className="doc-card-link"
                          onClick={() => showPage("insurance")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="doc-donut-wrap">
                        <svg width="126" height="126" viewBox="0 0 130 130">
                          {/* Background Track */}
                          <circle
                            cx="65"
                            cy="65"
                            r="44"
                            stroke={darkMode ? "#13233c" : "#f1f5f9"}
                            strokeWidth="14"
                            fill="none"
                          />
                          {/* Segment 1: Approved 60% */}
                          <circle
                            cx="65"
                            cy="65"
                            r="44"
                            stroke="#10b981"
                            strokeWidth="14"
                            strokeDasharray="160 276.46"
                            strokeDashoffset="0"
                            fill="none"
                            transform="rotate(-90 65 65)"
                          />
                          {/* Segment 2: Pending 20% */}
                          <circle
                            cx="65"
                            cy="65"
                            r="44"
                            stroke="#f59e0b"
                            strokeWidth="14"
                            strokeDasharray="50 276.46"
                            strokeDashoffset="-165"
                            fill="none"
                            transform="rotate(-90 65 65)"
                          />
                          {/* Segment 3: Rejected 20% */}
                          <circle
                            cx="65"
                            cy="65"
                            r="44"
                            stroke="#ef4444"
                            strokeWidth="14"
                            strokeDasharray="50 276.46"
                            strokeDashoffset="-220"
                            fill="none"
                            transform="rotate(-90 65 65)"
                          />
                          {/* Center Text */}
                          <text
                            x="65"
                            y="62"
                            textAnchor="middle"
                            fontWeight="900"
                            fontSize="24"
                            fill={darkMode ? "#ffffff" : "#0f2b48"}
                          >
                            5
                          </text>
                          <text
                            x="65"
                            y="78"
                            textAnchor="middle"
                            fontSize="10"
                            fill={darkMode ? "#8ba3c7" : "#64748b"}
                            fontWeight="700"
                          >
                            Total Claims
                          </text>
                        </svg>

                        <div className="doc-donut-legend-col">
                          <div className="doc-donut-legend-item">
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              Approved
                            </span>
                            <span>3 (60%)</span>
                          </div>
                          <div className="doc-donut-legend-item">
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                              Pending
                            </span>
                            <span>1 (20%)</span>
                          </div>
                          <div className="doc-donut-legend-item">
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                              Rejected
                            </span>
                            <span>1 (20%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subgrid 2: Recent Patient Records + Medical Statistics */}
                  <div className="doc-bottom-subgrid">
                    {/* Recent Patient Records Table Card */}
                    <div className="doc-card card-medical-records">
                      <div className="doc-card-header">
                        <h3>Recent Patient Records</h3>
                        <button
                          type="button"
                          className="doc-card-link"
                          onClick={() => showPage("patients")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="doc-table-wrap">
                        <table className="doc-records-table">
                          <thead>
                            <tr>
                              <th>Patient Name</th>
                              <th>Age / Gender</th>
                              <th>Last Visit</th>
                              <th>Condition</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentPatientRecords.map((pat, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div className="doc-patient-cell">
                                    <div className="doc-patient-avatar">{pat.initials}</div>
                                    <span>{pat.name}</span>
                                  </div>
                                </td>
                                <td>{pat.ageGender}</td>
                                <td>{pat.visit}</td>
                                <td>{pat.condition}</td>
                                <td>
                                  <span className="doc-status-badge active">{pat.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Medical Statistics 2x2 Grid Card */}
                    <div className="doc-card card-health-goals">
                      <div className="doc-card-header">
                        <h3>Medical Statistics</h3>
                        <button
                          type="button"
                          className="doc-card-link"
                          onClick={() => showPage("reports")}
                        >
                          View All →
                        </button>
                      </div>

                      <div className="doc-stats-2x2">
                        <div className="doc-stat-tile">
                          <div className="doc-tile-icon heart">❤️</div>
                          <div className="doc-tile-label">Total Patients</div>
                          <div className="doc-tile-value">248</div>
                          <div className="doc-tile-trend">↑ 12%</div>
                        </div>

                        <div className="doc-stat-tile">
                          <div className="doc-tile-icon steth">🩺</div>
                          <div className="doc-tile-label">Appointments</div>
                          <div className="doc-tile-value">12</div>
                          <div className="doc-tile-trend">↑ 20%</div>
                        </div>

                        <div className="doc-stat-tile">
                          <div className="doc-tile-icon doc">📄</div>
                          <div className="doc-tile-label">Claims Processed</div>
                          <div className="doc-tile-value">5</div>
                          <div className="doc-tile-trend">↑ 67%</div>
                        </div>

                        <div className="doc-stat-tile">
                          <div className="doc-tile-icon folder">📁</div>
                          <div className="doc-tile-label">Records Accessed</div>
                          <div className="doc-tile-value">36</div>
                          <div className="doc-tile-trend">↑ 18%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column Stack */}
                <div className="doc-right-stack">
                  {/* Upcoming Appointments Card with Mini Calendar */}
                  <div className="doc-card card-appointments">
                    <div className="doc-card-header">
                      <h3>Upcoming Appointments</h3>
                      <button
                        type="button"
                        className="doc-card-link"
                        onClick={() => showPage("appointments")}
                      >
                        View All →
                      </button>
                    </div>

                    {/* Mini Calendar Header */}
                    <div className="doc-cal-header">
                      <span>{calMonth}</span>
                      <div className="doc-cal-arrows">
                        <button
                          type="button"
                          className="doc-cal-btn"
                          onClick={() => setCalMonth("September 2026")}
                          title="Previous month"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="doc-cal-btn"
                          onClick={() => setCalMonth("November 2026")}
                          title="Next month"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {/* Calendar Days of Week & Grid */}
                    <div className="doc-cal-grid">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                        <div key={idx} className="doc-cal-day-name">{day}</div>
                      ))}
                      {calDays.map((c, idx) => (
                        <div
                          key={idx}
                          className={`doc-cal-cell ${c.muted ? "muted" : ""} ${selectedDay === c.day && !c.muted ? "active" : ""}`}
                          onClick={() => {
                            if (!c.muted) {
                              setSelectedDay(c.day);
                              onAlert?.(`Selected schedule date: ${c.day} ${calMonth}`, "info");
                            }
                          }}
                        >
                          {c.day}
                        </div>
                      ))}
                    </div>

                    {/* Appointments List with Live Patient Reports */}
                    <div className="doc-apt-list">
                      {liveDoctorAppointments.map((apt, idx) => (
                        <div
                          key={idx}
                          className="doc-apt-row"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (apt.reports && apt.reports.length > 0) {
                              setSelectedPatientReport({ ...apt.reports[0], patient: apt.patient, allReports: apt.reports });
                            } else {
                              showPage("appointments");
                            }
                          }}
                        >
                          <div className="doc-apt-time">{apt.time}</div>
                          <img src={apt.avatar} alt={apt.name} className="doc-apt-avatar" />
                          <div className="doc-apt-info">
                            <div className="doc-apt-name">Patient: {apt.patient || apt.name}</div>
                            <div className="doc-apt-spec">{apt.date} • {apt.spec}</div>
                            {apt.reports && apt.reports.length > 0 && (
                              <div style={{ marginTop: 4 }}>
                                <span className="file-attached-badge" style={{ fontSize: "11px", padding: "2px 7px" }}>
                                  📎 {apt.reports.length} Report{apt.reports.length > 1 ? "s" : ""} Attached
                                </span>
                              </div>
                            )}
                          </div>
                          <span className={`doc-apt-badge ${apt.status === "Confirmed" ? "confirmed" : "pending"}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="doc-card card-quick-actions">
                    <div className="doc-card-header">
                      <h3>Quick Actions</h3>
                    </div>
                    <div className="doc-quick-list">
                      <button
                        type="button"
                        className="doc-quick-btn"
                        onClick={() => showPage("appointments")}
                      >
                        <div className="doc-quick-btn-left">
                          <span>📅</span>
                          <span>Book Appointment</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        className="doc-quick-btn"
                        onClick={() => showPage("insurance")}
                      >
                        <div className="doc-quick-btn-left">
                          <span>🛡️</span>
                          <span>Submit Insurance Claim</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        className="doc-quick-btn"
                        onClick={() => showPage("documents")}
                      >
                        <div className="doc-quick-btn-left">
                          <span>📁</span>
                          <span>View Medical Records</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        className="doc-quick-btn"
                        onClick={() => showPage("doctors")}
                      >
                        <div className="doc-quick-btn-left">
                          <span>🩺</span>
                          <span>Find a Doctor</span>
                        </div>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* Subpages: When navigating to Appointments, Patients, Claims, Documents, etc. */}
          {page !== "overview" && (
            <main className="doc-content-area">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <button
                  type="button"
                  className="btn-light"
                  onClick={() => showPage("overview")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                >
                  ← Back to Doctor Dashboard
                </button>
                <div style={{ fontWeight: 800, fontSize: "16px", color: darkMode ? "#38bdf8" : "#00a896" }}>
                  Doctor Clinical View: {doctor.name}
                </div>
              </div>

              {page === "patients" && (
                <div className="doc-card">
                  <div className="doc-card-header">
                    <h3>Registered Patients Directory ({recentPatientRecords.length} Active Records)</h3>
                  </div>
                  <div className="doc-table-wrap">
                    <table className="doc-records-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Age / Gender</th>
                          <th>Last Consultation</th>
                          <th>Diagnosis / Condition</th>
                          <th>Assigned Doctor</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPatientRecords.map((pat, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="doc-patient-cell">
                                <div className="doc-patient-avatar">{pat.initials}</div>
                                <span>{pat.name}</span>
                              </div>
                            </td>
                            <td>{pat.ageGender}</td>
                            <td>{pat.visit}</td>
                            <td>{pat.condition}</td>
                            <td>{doctor.name}</td>
                            <td>
                              <span className="doc-status-badge active">{pat.status}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="doc-card-link"
                                onClick={() => onAlert?.(`Opening electronic health chart for ${pat.name}`, "info")}
                              >
                                View Chart →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {page === "reports" && (
                <div className="doc-card">
                  <div className="doc-card-header">
                    <h3>Clinical Performance & Analytics Report</h3>
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "13px", lineHeight: "1.6" }}>
                    Monthly clinical metrics, diagnosis breakdowns, prescription adherence, and insurance turnaround analysis for <strong>{doctor.name}</strong> ({doctor.specialty}).
                  </p>
                  <div className="doc-stat-grid" style={{ marginTop: "20px" }}>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Patient Satisfaction</div>
                      <div className="doc-stat-value" style={{ color: "#10b981" }}>98.6%</div>
                      <div className="doc-stat-trend">Based on 142 patient ratings</div>
                    </div>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Average Consultation Time</div>
                      <div className="doc-stat-value">18 min</div>
                      <div className="doc-stat-trend">Optimal clinical flow</div>
                    </div>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Claim Approval Rate</div>
                      <div className="doc-stat-value" style={{ color: "#3b82f6" }}>92.4%</div>
                      <div className="doc-stat-trend">Fast-track insurance desk</div>
                    </div>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Prescriptions Dispensed</div>
                      <div className="doc-stat-value">184</div>
                      <div className="doc-stat-trend">100% digitized QR e-Rx</div>
                    </div>
                  </div>
                </div>
              )}

              {page === "prescriptions" && (
                <div className="doc-card">
                  <div className="doc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <h3 style={{ margin: 0 }}>Clinical E-Prescription Desk 💊</h3>
                    <button type="button" className="doc-promo-btn" onClick={() => onAlert?.("E-Prescription pad initialized. Digital signature ready.", "success")}>
                      + Write e-Rx
                    </button>
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "13px", marginTop: "8px", marginBottom: "18px" }}>
                    Issue and dispense verified electronic prescriptions for your patients.
                  </p>
                  <div className="doc-stat-grid" style={{ marginBottom: "20px" }}>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Active Patient Prescriptions</div>
                      <div className="doc-stat-value" style={{ color: "#10b981" }}>184</div>
                      <div className="doc-stat-trend">100% digital compliance</div>
                    </div>
                    <div className="doc-stat-card">
                      <div className="doc-stat-label">Refill Approvals Pending</div>
                      <div className="doc-stat-value" style={{ color: "#f59e0b" }}>3</div>
                      <div className="doc-stat-trend">Awaiting review</div>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="doc-patients-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Schedule</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {initialPrescriptions.map((rx) => (
                          <tr key={rx.id}>
                            <td><strong>Aarav Sharma</strong></td>
                            <td><strong>{rx.name}</strong></td>
                            <td>{rx.dosage} ({rx.type})</td>
                            <td>{rx.frequency}</td>
                            <td><span className={`doc-tag ${rx.status === "Active" ? "confirmed" : "pending"}`}>{rx.status}</span></td>
                            <td>
                              <button
                                type="button"
                                className="dash-download-icon-btn"
                                title="Download e-Rx PDF"
                                onClick={() => {
                                  downloadPrescriptionPDF(rx, "Aarav Sharma");
                                  onAlert?.(`Downloaded digital prescription PDF for ${rx.name} to library!`, "success");
                                }}
                              >
                                📄
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {page === "lab-reports" && (
                <div className="doc-card">
                  <div className="doc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <h3 style={{ margin: 0 }}>Diagnostic & Pathology Review 🧪</h3>
                    <button type="button" className="doc-promo-btn" onClick={() => onAlert?.("Lab test requisition created.", "success")}>
                      + Order Lab Test
                    </button>
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "13px", marginTop: "8px", marginBottom: "18px" }}>
                    Review patient pathology panels, radiology scans, and clinical bio-markers.
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table className="doc-patients-table">
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Patient</th>
                          <th>Laboratory</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {initialLabReports.map((lab) => (
                          <tr key={lab.id}>
                            <td><strong>{lab.testName}</strong></td>
                            <td>Aarav Sharma</td>
                            <td>{lab.labName}</td>
                            <td>{lab.date}</td>
                            <td><span className={`doc-tag ${lab.status === "Normal" ? "confirmed" : "pending"}`}>{lab.status}</span></td>
                            <td>
                              <button
                                type="button"
                                className="dash-download-icon-btn"
                                title="Download Lab Report PDF"
                                onClick={() => {
                                  downloadDiagnosticLabPDF(lab, "Aarav Sharma");
                                  onAlert?.(`Downloaded diagnostic lab report PDF for ${lab.testName} to library!`, "success");
                                }}
                              >
                                🔬
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clinical Appointments & Patient Reports Portal */}
              {page === "appointments" && (
                <div className="doc-card">
                  <div className="doc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Doctor Appointments & Patient Intake Desk 📅</h3>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.8 }}>
                        Review patient consultations, clinical history, and attached medical reports & scans.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className={`rx-tab-pill ${docAptFilter === "all" ? "active" : ""}`}
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                        onClick={() => setDocAptFilter("all")}
                      >
                        All ({liveDoctorAppointments.length})
                      </button>
                      <button
                        type="button"
                        className={`rx-tab-pill ${docAptFilter === "reports" ? "active" : ""}`}
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                        onClick={() => setDocAptFilter("reports")}
                      >
                        📎 With Attached Reports ({liveDoctorAppointments.filter((a) => a.reports && a.reports.length > 0).length})
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto", marginTop: 16 }}>
                    <table className="doc-patients-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Schedule</th>
                          <th>Specialty / Doctor</th>
                          <th>Attached Reports & Scans</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Clinical Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocAppointments.map((apt, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="doc-patient-avatar">
                                  {(apt.patient || "Aarav").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{apt.patient || "Aarav Sharma"}</strong>
                                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>Mode: {apt.mode}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{apt.time}</strong>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>{apt.date}</div>
                            </td>
                            <td>
                              <span>{apt.spec}</span>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>{apt.doctor}</div>
                            </td>
                            <td>
                              {apt.reports && apt.reports.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  <span className="file-attached-badge" style={{ alignSelf: "flex-start" }}>
                                    📎 {apt.reports.length} File{apt.reports.length > 1 ? "s" : ""} Attached
                                  </span>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                                    {apt.reports.map((rep, rIdx) => (
                                      <span
                                        key={rIdx}
                                        onClick={() => setSelectedPatientReport({ ...rep, patient: apt.patient, allReports: apt.reports })}
                                        style={{ fontSize: "11px", color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}
                                        title={`View ${rep.name}`}
                                      >
                                        {rep.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : apt.insurancePaperName ? (
                                <span className="file-attached-badge">
                                  📎 {apt.insurancePaperName}
                                </span>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: "12px" }}>No files attached</span>
                              )}
                            </td>
                            <td>
                              <span className={`doc-tag ${apt.status === "Confirmed" ? "confirmed" : "pending"}`}>
                                {apt.status}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: 8 }}>
                                {apt.reports && apt.reports.length > 0 ? (
                                  <button
                                    type="button"
                                    className="btn btn-light"
                                    style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
                                    onClick={() => setSelectedPatientReport({ ...apt.reports[0], patient: apt.patient, allReports: apt.reports })}
                                  >
                                    👁️ Check Reports
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
                                  onClick={() => onAlert?.(`Starting clinical consultation with ${apt.patient || "patient"}...`, "success")}
                                >
                                  Consult
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Seamlessly allow browsing other clinical operations */}
              {(page === "insurance" || page === "documents" || page === "doctors") && (
                <div className="doc-card">
                  <div className="doc-card-header">
                    <h3>Clinical Operations: {page.toUpperCase()}</h3>
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "13px", marginBottom: "16px" }}>
                    You are viewing the clinical management tools for {page}.
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" className="doc-promo-btn" onClick={() => showPage("overview")}>
                      Return to Overview
                    </button>
                  </div>
                </div>
              )}
            </main>
          )}

          {/* Doctor Report Inspection Modal */}
          {selectedPatientReport && (
            <div className="modal-overlay" onClick={() => setSelectedPatientReport(null)}>
              <div className="contact-modal" style={{ maxWidth: 720, width: "95%" }} onClick={(e) => e.stopPropagation()}>
                <div className="contact-modal-header" style={{ background: "linear-gradient(135deg, #007f71, #00a896)", color: "white" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "white" }}>Patient Diagnostic Report Review 🔬</h3>
                    <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.9)" }}>
                      Patient: <strong>{selectedPatientReport.patient || "Aarav Sharma"}</strong> • File: {selectedPatientReport.name}
                    </p>
                  </div>
                  <button className="modal-close-btn" style={{ color: "white" }} onClick={() => setSelectedPatientReport(null)}>✕</button>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* If multiple reports attached, show tabs/thumbnails */}
                  {selectedPatientReport.allReports && selectedPatientReport.allReports.length > 1 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                      {selectedPatientReport.allReports.map((rep, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`rx-tab-pill ${selectedPatientReport.name === rep.name ? "active" : ""}`}
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                          onClick={() => setSelectedPatientReport({ ...rep, patient: selectedPatientReport.patient, allReports: selectedPatientReport.allReports })}
                        >
                          📎 {rep.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Report Image Viewer */}
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid #e2e8f0", marginBottom: 16 }}>
                    {selectedPatientReport.preview && selectedPatientReport.preview !== "/swasthyaone-logo-icon.png" ? (
                      <img
                        src={selectedPatientReport.preview}
                        alt={selectedPatientReport.name}
                        style={{ maxWidth: "100%", maxHeight: "380px", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
                      />
                    ) : (
                      <div style={{ padding: "30px 10px" }}>
                        <span style={{ fontSize: "56px" }}>📄</span>
                        <h4 style={{ margin: "12px 0 4px 0", color: "#0f172a" }}>{selectedPatientReport.name}</h4>
                        <p className="muted">{selectedPatientReport.type || "Medical Diagnostic Document"} • {selectedPatientReport.size || "1.2 MB"}</p>
                        <span className="file-attached-badge">✓ Verified Patient Medical Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Clinical Assessment Notes Box */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: 6 }}>
                      Doctor's Clinical Observations & Notes:
                    </label>
                    <textarea
                      rows="3"
                      className="contact-form textarea"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                      placeholder="Enter clinical assessment notes, highlighted parameters, or treatment recommendations..."
                      value={doctorNoteText}
                      onChange={(e) => setDoctorNoteText(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      <span>Reviewed by: <strong>{doctor.name}</strong> ({doctor.specialty})</span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          onAlert?.(`Doctor clinical notes recorded for ${selectedPatientReport.name}!`, "success");
                        }}
                      >
                        💾 Save Note
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          downloadReportOrScan(selectedPatientReport, selectedPatientReport.patient || "Aarav Sharma");
                          onAlert?.(`Downloaded ${selectedPatientReport.name} to your device library!`, "success");
                        }}
                      >
                        ⬇️ Download Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <footer className="doc-footer">
            <div>
              ❤️ SwasthyaOne • Secure • Trusted • Always with you
            </div>
            <div>
              © 2026 SwasthyaOne. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Dashboard({
  onBack,
  darkMode,
  toggleTheme,
  initialTab = "overview",
  currency = "INR",
  onCurrencyChange,
  onAlert,
  onNavigate,
  userName = "Aarav Sharma",
  onUpdateUserName,
}) {
  const isDoctor = isDoctorUser(userName);

  const [page, setPage] = useState(initialTab || "overview");
  const [history, setHistory] = useState([]);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [payments, setPayments] = useState(initialPayments);
  const [claims, setClaims] = useState(initialClaims);
  const [apiLoaded, setApiLoaded] = useState(false);
  useEffect(() => {
    if (!apiToken) return;
    let active = true;
    (async () => {
      try {
        const data = await apiRequest("/dashboard", { token: apiToken });
        if (!active) return;
        setAppointments((data.appointments || []).map(a => ({
          id: a.id, doctor: a.doctorName, date: formatDate(a.date), time: a.time,
          status: a.status, specialty: a.specialty
        })));
        setClaims((data.claims || []).map(c => ({
          id: c.id, title: `${c.provider} • ${c.claimType}`, amount: c.amount,
          status: c.status, date: c.submittedAt
        })));
        setPrescriptions((data.prescriptions || []).map(r => ({
          id: r.id, name: r.medicine, dosage: r.dosage, instructions: r.instructions,
          status: r.status, refillDate: r.refillDate
        })));
        setApiLoaded(true);
      } catch (error) {
        onAlert?.(`Could not load your live patient data: ${error.message}`, "error");
      }
    })();
    return () => { active = false; };
  }, [apiToken]);
  const [documents, setDocuments] = useState(initialDocuments);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [labReports, setLabReports] = useState(initialLabReports);
  const [rxFilter, setRxFilter] = useState("all");
  const [labFilter, setLabFilter] = useState("all");
  const [labSearch, setLabSearch] = useState("");
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [showBookLabModal, setShowBookLabModal] = useState(false);
  const [selectedLabReport, setSelectedLabReport] = useState(null);

  // New Rx form state
  const [newRxName, setNewRxName] = useState("");
  const [newRxDosage, setNewRxDosage] = useState("");
  const [newRxType, setNewRxType] = useState("Tablet");
  const [newRxCategory, setNewRxCategory] = useState("Antibiotic • Infection");
  const [newRxDoctor, setNewRxDoctor] = useState(doctors[0].name);
  const [newRxFreq, setNewRxFreq] = useState("Twice daily (After meals)");
  const [newRxSchedule, setNewRxSchedule] = useState("Morning (8:00 AM) • Night (8:00 PM)");
  const [newRxDays, setNewRxDays] = useState("14");
  const [newRxInstructions, setNewRxInstructions] = useState("");
  const [newRxPharmacy, setNewRxPharmacy] = useState("Apollo Pharmacy, Bandra West");

  // New Lab Booking state
  const [newLabTest, setNewLabTest] = useState("Complete Blood Count (CBC)");
  const [newLabCategory, setNewLabCategory] = useState("Hematology");
  const [newLabCenter, setNewLabCenter] = useState("Apollo Diagnostics Centre");
  const [newLabDate, setNewLabDate] = useState("");
  const [newLabDoctor, setNewLabDoctor] = useState(doctors[0].name);
  const [newLabHomeVisit, setNewLabHomeVisit] = useState(true);
  const [patientName, setPatientName] = useState(userName || "Aarav Sharma");
  const [doctorName, setDoctorName] = useState(doctors[0].name);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:30 AM");
  const [appointmentPaymentMode, setAppointmentPaymentMode] = useState("UPI (Google Pay)");
  const [claimTitle, setClaimTitle] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimPaper, setClaimPaper] = useState(null);
  const [claimPaperName, setClaimPaperName] = useState("");
  const [claimPaperPreview, setClaimPaperPreview] = useState(null);
  const [claimPaperSize, setClaimPaperSize] = useState("");

  const [aptReports, setAptReports] = useState([]);

  const [viewingInsuranceDoc, setViewingInsuranceDoc] = useState(null);
  const [query, setQuery] = useState("");
  const [checklist, setChecklist] = useState([false, false, false, false]);
  const [checkResult, setCheckResult] = useState("");

  // Profile Modal & Health States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [healthProblem, setHealthProblem] = useState(() => {
    try {
      return localStorage.getItem("swasthyaHealthProblem") || "General Wellness & Routine Checkup";
    } catch {
      return "General Wellness & Routine Checkup";
    }
  });
  const [heightCm, setHeightCm] = useState(() => {
    try {
      return localStorage.getItem("swasthyaHeight") || "172";
    } catch {
      return "172";
    }
  });
  const [weightKg, setWeightKg] = useState(() => {
    try {
      return localStorage.getItem("swasthyaWeight") || "66";
    } catch {
      return "66";
    }
  });
  const [bmi, setBmi] = useState(() => {
    try {
      return localStorage.getItem("swasthyaBMI") || "22.3";
    } catch {
      return "22.3";
    }
  });
  const [emergencyContact, setEmergencyContact] = useState(() => {
    try {
      return localStorage.getItem("swasthyaEmergencyPhone") || "+91 98765 43210";
    } catch {
      return "+91 98765 43210";
    }
  });
  const [bloodGroup, setBloodGroup] = useState(() => {
    try {
      return localStorage.getItem("swasthyaBloodGroup") || "O+";
    } catch {
      return "O+";
    }
  });

  const bmiCategory = useMemo(() => {
    const num = parseFloat(bmi);
    if (isNaN(num) || num <= 0) return { label: "Normal", bg: "#dcfce7", color: "#14532d" };
    if (num < 18.5) return { label: "Underweight", bg: "#e0f2fe", color: "#0369a1" };
    if (num <= 24.9) return { label: "Normal Weight", bg: "#dcfce7", color: "#14532d" };
    if (num <= 29.9) return { label: "Overweight", bg: "#fef3c7", color: "#b45309" };
    return { label: "Obese", bg: "#fee2e2", color: "#b91c1c" };
  }, [bmi]);

  // Payment form states
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPayTitle, setNewPayTitle] = useState("Doctor Consultation");
  const [newPayAmount, setNewPayAmount] = useState(800);
  const [newPayMode, setNewPayMode] = useState("UPI (Google Pay)");
  const [overviewRange, setOverviewRange] = useState("7d");

  const chartDatasets = useMemo(() => ({
    "7d": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      steps: [6400, 7800, 8200, 7100, 9500, 10800, 8900],
      heart: [72, 76, 70, 74, 68, 75, 71],
      sleep: [7.2, 6.8, 7.5, 8.0, 7.0, 8.4, 7.8],
    },
    "30d": {
      labels: ["W1", "W2", "W3", "W4", "W5"],
      steps: [7200, 8100, 8900, 7600, 9400],
      heart: [74, 71, 73, 70, 72],
      sleep: [7.1, 7.4, 7.6, 7.0, 7.8],
    },
    "3m": {
      labels: ["Aug", "Sep", "Oct"],
      steps: [7600, 8300, 9100],
      heart: [73, 71, 70],
      sleep: [7.2, 7.5, 7.7],
    },
  }), []);

  useEffect(() => {
    if (initialTab) {
      setPage(initialTab);
      window.scrollTo(0, 0);
    }
  }, [initialTab]);

  useEffect(() => {
    if (userName && userName.trim()) {
      setPatientName(userName.trim());
    }
  }, [userName]);

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    if (page === "overview") {
      onNavigate?.("/home", "overview", true);
    } else {
      onNavigate?.(`/${page}`, page, true);
    }
  }, [page, onNavigate]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.name === doctorName) || doctors[0];
  }, [doctorName]);

  const upcoming = useMemo(() => appointments.map((a, i) => (
    <Row key={`${a.doctor}-${a.date}-${i}`}>
      <div className="row-info">
        <strong>{a.doctor}</strong>
        <p>{a.date} · {a.time} {a.mode ? `· ${a.mode}` : ""}</p>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {a.insurancePaperName && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="file-attached-badge">
                📎 {a.insurancePaperName}
              </span>
              {a.insurancePaperPreview && (
                <button
                  type="button"
                  className="btn-light"
                  style={{ padding: "2px 8px", fontSize: "11px", borderRadius: "6px" }}
                  onClick={() => setViewingInsuranceDoc({ name: a.insurancePaperName, preview: a.insurancePaperPreview, isMedical: false })}
                >
                  👁️ View Paper
                </button>
              )}
            </div>
          )}
          {a.reports && a.reports.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="file-attached-badge" style={{ background: "rgba(2,132,199,0.12)", color: "#0284c7", borderColor: "rgba(2,132,199,0.25)" }}>
                📁 {a.reports.length} Medical File{a.reports.length > 1 ? "s" : ""} Attached
              </span>
              <button
                type="button"
                className="btn-light"
                style={{ padding: "2px 8px", fontSize: "11px", borderRadius: "6px" }}
                onClick={() => setViewingInsuranceDoc({
                  name: a.reports[0].name,
                  preview: a.reports[0].preview,
                  size: a.reports[0].size,
                  allReports: a.reports,
                  isMedical: true,
                })}
              >
                👁️ View Reports
              </button>
            </div>
          )}
        </div>
      </div>
      <span className="tag">{a.status}</span>
    </Row>
  )), [appointments]);

  const claimRows = useMemo(() => claims.map((c, i) => (
    <Row key={`${c.title}-${i}`}>
      <div className="row-info">
        <strong>{c.title}</strong>
        <p>Amount: {formatMoney(c.amount, currency)}</p>
        {c.insurancePaperName && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="file-attached-badge">
              📎 {c.insurancePaperName}
            </span>
            {c.insurancePaperPreview && (
              <button
                type="button"
                className="btn-light"
                style={{ padding: "2px 8px", fontSize: "11px", borderRadius: "6px" }}
                onClick={() => setViewingInsuranceDoc({ name: c.insurancePaperName, preview: c.insurancePaperPreview })}
              >
                👁️ View Paper
              </button>
            )}
          </div>
        )}
      </div>
      <span className="tag">{c.status}</span>
    </Row>
  )), [claims, currency]);

  const paymentRows = useMemo(() => payments.map((p, i) => (
    <Row key={`${p.title}-${i}`}>
      <div className="row-info">
        <strong>{p.title}</strong>
        <p>
          Amount: <strong>{formatMoney(p.amount, currency)}</strong>
          {p.mode && ` · Mode: ${p.mode}`}
          {p.date && ` · ${p.date}`}
        </p>
      </div>
      <span className="tag">{p.status}</span>
    </Row>
  )), [payments, currency]);

  const documentRows = useMemo(() => documents.map((doc, i) => (
    <Row key={`${doc}-${i}`}>
      <div className="row-info">
        <strong>{doc}</strong>
        <p>Ready for claim submission • Verified clinical document</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="btn-light"
          style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "6px" }}
          onClick={() => {
            downloadMedicalRecord({ type: doc, desc: "SwasthyaOne Clinical Document", date: "2026" }, patientName || "Aarav Sharma");
            onAlert?.(`Downloaded ${doc} to your device library!`, "success");
          }}
          title={`Download ${doc} to library`}
        >
          ⬇️ Download
        </button>
        <span className="tag">Verified</span>
      </div>
    </Row>
  )), [documents, patientName]);

  function showPage(nextPage) {
    if (nextPage === page) return;
    setHistory((prev) => [...prev, page]);
    setPage(nextPage);
    const targetPath = nextPage === "overview" ? "/home" : `/${nextPage}`;
    onNavigate?.(targetPath, nextPage);
    window.scrollTo(0, 0);
  }

  function goBack() {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((old) => old.slice(0, -1));
      setPage(prev);
    } else {
      onBack();
    }
  }

  function searchSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;
    const match = doctors.find((d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query.toLowerCase()) ||
      d.clinic.toLowerCase().includes(query.toLowerCase())
    );
    if (match) {
      setDoctorName(match.name);
      showPage("doctors");
    } else {
      onAlert?.(`No doctor found matching "${query}". Showing all doctors.`, "warning");
      showPage("doctors");
    }
  }

  function handleClaimPaperUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setClaimPaper(file);
    setClaimPaperName(file.name);
    const sizeKb = (file.size / 1024).toFixed(1);
    setClaimPaperSize(Number(sizeKb) > 1000 ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setClaimPaperPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setClaimPaperPreview("/swasthyaone-logo-icon.png");
    }
    onAlert?.(`Attached insurance paper photo: ${file.name} (Optional)`, "info");
  }

  function handleAptReportUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    files.forEach((file) => {
      const sizeKb = (file.size / 1024).toFixed(1);
      const formattedSize = Number(sizeKb) > 1000 ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newRep = {
            id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            preview: event.target.result,
            size: formattedSize,
            type: file.name.toLowerCase().includes("blood") ? "Blood Test Report" : file.name.toLowerCase().includes("xray") || file.name.toLowerCase().includes("scan") ? "Radiology Scan" : "Medical Diagnostic Report",
            date: "Today",
          };
          setAptReports((prev) => [...prev, newRep]);
        };
        reader.readAsDataURL(file);
      } else {
        const newRep = {
          id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          preview: "/swasthyaone-logo-icon.png",
          size: formattedSize,
          type: "Clinical Document",
          date: "Today",
        };
        setAptReports((prev) => [...prev, newRep]);
      }
    });
    
    onAlert?.(`Attached ${files.length} report/scan photo(s) for the doctor! (Optional)`, "success");
  }

  function handleRemoveAptReport(id) {
    setAptReports((prev) => prev.filter((r) => r.id !== id));
  }

  function addAppointment(event) {
    event.preventDefault();
    if (!appointmentDate) {
      onAlert?.("Please select an appointment date.", "error");
      return;
    }
    if (apiToken) {
      apiRequest("/appointments", {
        token: apiToken, method: "POST",
        body: JSON.stringify({
          doctorName, specialty: selectedDoctor?.specialty || "General Physician",
          date: appointmentDate, time: appointmentTime
        })
      }).then(() => {
        onAlert?.("Appointment request saved to your account.", "success");
      }).catch(error => onAlert?.(`Appointment could not be saved: ${error.message}`, "error"));
    }
    const newApt = {
      doctor: doctorName,
      patient: patientName || userName || "Aarav Sharma",
      date: formatDate(appointmentDate) || appointmentDate,
      time: appointmentTime,
      mode: appointmentPaymentMode,
      status: "Confirmed",
      reports: [...aptReports],
    };
    setAppointments((prev) => [newApt, ...prev]);
    aptReports.forEach((r) => {
      setDocuments((old) => [`${r.name} (Patient Report)`, ...old]);
    });
    setAptReports([]);

    // Also register payment record for convenience
    const docFee = selectedDoctor?.fee || 800;
    setPayments((prev) => [
      {
        title: `Consultation with ${doctorName}`,
        amount: docFee,
        mode: appointmentPaymentMode,
        date: formatDate(appointmentDate) || "Today",
        status: "Paid",
      },
      ...prev,
    ]);

    onAlert?.(
      `Appointment confirmed with ${doctorName} on ${formatDate(appointmentDate)} at ${appointmentTime}!\nFee: ${formatMoney(
        docFee,
        currency
      )} via ${appointmentPaymentMode}`,
      "success"
    );
    setAppointmentDate("");
    showPage("appointments");
  }

  function bookDoctor(name) {
    setDoctorName(name);
    showPage("appointments");
  }

  function handleCreatePayment(e) {
    e.preventDefault();
    const amt = Number(newPayAmount) || 500;
    setPayments((old) => [
      {
        title: newPayTitle,
        amount: amt,
        mode: newPayMode,
        date: "Today",
        status: "Paid",
      },
      ...old,
    ]);
    onAlert?.(
      `Payment of ${formatMoney(amt, currency)} via ${newPayMode} recorded successfully!`,
      "success"
    );
    setShowAddPaymentModal(false);
  }

  function addClaim(event) {
    event.preventDefault();
    if (!claimTitle || !claimAmount) return;
    const amt = Number(claimAmount);
    const newClaim = {
      title: claimTitle,
      amount: amt,
      status: "In Review",
      insurancePaperName: claimPaperName || null,
      insurancePaperPreview: claimPaperPreview || null,
      insurancePaperSize: claimPaperSize || null,
      date: "Today",
    };
    if (apiToken) {
      apiRequest("/claims", {
        token: apiToken, method: "POST",
        body: JSON.stringify({ provider: "Care Secure", claimType: claimTitle, amount: amt })
      }).catch(error => onAlert?.(`Claim could not be saved: ${error.message}`, "error"));
    }
    setClaims((prev) => [newClaim, ...prev]);
    if (claimPaperName) {
      setDocuments((old) => [`${claimPaperName} (Claim Document)`, ...old]);
    }
    onAlert?.(
      claimPaperName
        ? `Claim of ${formatMoney(amt, currency)} submitted with attached insurance paper (${claimPaperName})!`
        : `Claim of ${formatMoney(amt, currency)} submitted for review!`,
      "success"
    );
    setClaimTitle("");
    setClaimAmount("");
    setClaimPaper(null);
    setClaimPaperName("");
    setClaimPaperPreview(null);
    setClaimPaperSize("");
  }

  function handleRequestRefill(rxId, rxName) {
    setPrescriptions((prev) =>
      prev.map((r) =>
        r.id === rxId ? { ...r, status: "Refill Requested ⏳", refillsLeft: Math.max(0, r.refillsLeft - 1) } : r
      )
    );
    onAlert?.(`Refill request submitted for ${rxName}! Our pharmacy partner will deliver your order.`, "success");
  }

  function handleDownloadRx(rx) {
    try {
      downloadPrescriptionPDF(rx, patientName || "Aarav Sharma");
      onAlert?.(`Downloaded digital prescription PDF for ${rx.name} to your device library!`, "success");
    } catch (err) {
      console.error(err);
      onAlert?.(`Downloaded digital prescription for ${rx.name}!`, "info");
    }
  }

  function handleMarkTaken(rxId, rxName) {
    onAlert?.(`Dose logged for ${rxName}. Excellent medication adherence!`, "success");
  }

  function handleAddPrescription(e) {
    e.preventDefault();
    if (!newRxName.trim()) {
      onAlert?.("Please enter medication name.", "warning");
      return;
    }
    const days = Number(newRxDays) || 14;
    const newEntry = {
      id: `rx-${Date.now()}`,
      name: newRxName.trim(),
      dosage: newRxDosage.trim() || "500 mg",
      type: newRxType,
      category: newRxCategory,
      doctor: newRxDoctor,
      doctorSpec: getDoctorProfile(newRxDoctor).specialty || "Specialist",
      frequency: newRxFreq,
      schedule: newRxSchedule,
      startDate: "Today",
      endDate: `In ${days} days`,
      daysLeft: days,
      totalDays: days,
      status: "Active",
      refillsLeft: 2,
      instructions: newRxInstructions.trim() || "Take as directed by doctor with water.",
      pharmacy: newRxPharmacy,
    };
    setPrescriptions((prev) => [newEntry, ...prev]);
    setShowAddRxModal(false);
    setNewRxName("");
    setNewRxDosage("");
    setNewRxInstructions("");
    onAlert?.(`New prescription for ${newEntry.name} added successfully!`, "success");
  }

  function handleDownloadLab(report) {
    try {
      downloadDiagnosticLabPDF(report, patientName || "Aarav Sharma");
      onAlert?.(`Downloaded official lab report PDF for ${report.testName} to your device library!`, "success");
    } catch (err) {
      console.error(err);
      onAlert?.(`Downloaded lab report: ${report.testName}!`, "info");
    }
  }

  function handleBookLab(e) {
    e.preventDefault();
    const formattedDate = newLabDate ? formatDate(newLabDate) : "Tomorrow";
    const newEntry = {
      id: `lab-${Date.now()}`,
      testName: newLabTest,
      category: newLabCategory,
      labName: newLabCenter,
      doctor: newLabDoctor,
      date: formattedDate,
      sampleType: newLabHomeVisit ? "Home Sample Collection" : "Center Walk-In",
      status: "Pending",
      turnaround: "Sample Scheduled",
      summary: `Sample collection scheduled for ${formattedDate} (${newLabHomeVisit ? "Home Visit" : "At Center"}).`,
      fileSize: "Pending",
      fileName: `${newLabTest.replace(/[^a-zA-Z0-9]/g, "_")}_Booking.pdf`,
      metrics: [
        { name: "Sample Status", value: "Booked", ref: "Awaiting Phlebotomist", status: "normal" },
        { name: "Collection Mode", value: newLabHomeVisit ? "Home Visit" : "Center Walk-In", ref: "Confirmed", status: "normal" },
      ],
    };
    setLabReports((prev) => [newEntry, ...prev]);
    setShowBookLabModal(false);
    onAlert?.(`Lab test booked: ${newLabTest} at ${newLabCenter} for ${formattedDate}!`, "success");
  }

  const filteredPrescriptions = useMemo(() => {
    if (rxFilter === "all") return prescriptions;
    return prescriptions.filter((r) => r.status === rxFilter || (rxFilter === "Refill Due" && r.status.includes("Refill")));
  }, [prescriptions, rxFilter]);

  const filteredLabReports = useMemo(() => {
    return labReports.filter((lab) => {
      const matchCat = labFilter === "all" || lab.category.toLowerCase().includes(labFilter.toLowerCase());
      const query = labSearch.trim().toLowerCase();
      const matchSearch = !query || lab.testName.toLowerCase().includes(query) || lab.labName.toLowerCase().includes(query) || lab.doctor.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [labReports, labFilter, labSearch]);

  if (isDoctor) {
    return (
      <DoctorDashboardView
        onBack={onBack}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        userName={userName}
        onUpdateUserName={onUpdateUserName}
        onAlert={onAlert}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        page={page}
        showPage={showPage}
        claims={claims}
        appointments={appointments}
        documents={documents}
      />
    );
  }

  return (
    <div className={`dashboard-shell ${darkMode ? "dark-mode" : ""}`}>
      <div className="app">
        <aside className="sidebar">
          <div>
            <div className="dash-brand" onClick={() => showPage("overview")} role="button" tabIndex={0}>
              <div className="dash-brand-icon">
                <img
                  src="/swasthyaone-logo-icon.png"
                  alt="SwasthyaOne Logo"
                  className="brand-logo-img"
                />
              </div>
              <div>
                <div className="dash-brand-title">Swasthya<span>One</span></div>
                <div className="dash-brand-sub">Healthcare Saathi</div>
              </div>
            </div>
            <div className="nav-label">MAIN MENU</div>
            <nav className="sidebar-nav">
              <button
                type="button"
                className={page === "overview" ? "active" : ""}
                onClick={() => showPage("overview")}
              >
                <span className="sidebar-nav-icon">🏠</span>
                <span>Home</span>
              </button>
              <button
                type="button"
                className={page === "appointments" ? "active" : ""}
                onClick={() => showPage("appointments")}
              >
                <span className="sidebar-nav-icon">📅</span>
                <span>My Appointments</span>
              </button>
              <button
                type="button"
                className={page === "doctors" ? "active" : ""}
                onClick={() => showPage("doctors")}
              >
                <span className="sidebar-nav-icon">🩺</span>
                <span>Find Doctors</span>
              </button>
              <button
                type="button"
                className={page === "insurance" ? "active" : ""}
                onClick={() => showPage("insurance")}
              >
                <span className="sidebar-nav-icon">🛡️</span>
                <span>Insurance Claims</span>
              </button>
              <button
                type="button"
                className={page === "documents" ? "active" : ""}
                onClick={() => showPage("documents")}
              >
                <span className="sidebar-nav-icon">📄</span>
                <span>Medical Records</span>
              </button>
              <button
                type="button"
                className={page === "payments" ? "active" : ""}
                onClick={() => showPage("payments")}
              >
                <span className="sidebar-nav-icon">💳</span>
                <span>Payments</span>
              </button>
              <button
                type="button"
                className={page === "prescriptions" ? "active" : ""}
                onClick={() => showPage("prescriptions")}
              >
                <span className="sidebar-nav-icon">💊</span>
                <span>Prescriptions</span>
              </button>
              <button
                type="button"
                className={page === "lab-reports" ? "active" : ""}
                onClick={() => showPage("lab-reports")}
              >
                <span className="sidebar-nav-icon">🧪</span>
                <span>Lab Reports</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOverviewRange("7d");
                  showPage("overview");
                }}
              >
                <span className="sidebar-nav-icon">📈</span>
                <span>Health Tracker</span>
              </button>
              <button
                type="button"
                onClick={() => onAlert?.("You have 3 unread messages from Dr. Priya Sharma.", "info")}
              >
                <span className="sidebar-nav-icon">💬</span>
                <span>Messages</span>
                <span className="sidebar-badge">3</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(true);
                  setIsSettingsOpen(true);
                }}
              >
                <span className="sidebar-nav-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="sidebar-promo-card">
              <div className="sidebar-promo-icon">✨</div>
              <h4>Take control of your health</h4>
              <p>Track appointments, vitals, and claims seamlessly.</p>
              <button
                type="button"
                className="sidebar-promo-btn"
                onClick={() => showPage("appointments")}
              >
                Explore Features
              </button>
            </div>

            <div
              className="sidebar-user-pill"
              onClick={() => {
                setShowProfileModal(true);
                setIsSettingsOpen(false);
              }}
              role="button"
              tabIndex={0}
              title="Click to view & edit Health Profile"
            >
              <div className="sidebar-avatar-circle">
                {(patientName || "D")[0].toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{patientName || "Daksh"}</div>
                <div className="sidebar-user-id">Patient ID: HP123456</div>
              </div>
              <span className="sidebar-user-chevron">›</span>
            </div>
          </div>
        </aside>
        <main className="dashboard-main">
          <header className="topbar">
            <form className="search-wrap" onSubmit={searchSubmit}>
              <span className="search-icon-inside">🔍</span>
              <input
                className="search-pill-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors, hospitals, symptoms..."
              />
            </form>
            <div className="topbar-actions">
              <div className="topbar-currency-wrap dash-currency">
                <span className="currency-globe-icon">🌐</span>
                <select
                  className="topbar-currency-select"
                  value={currency}
                  onChange={(e) => onCurrencyChange?.(e.target.value)}
                  aria-label="Currency"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="AED">AED</option>
                </select>
              </div>
              <button
                type="button"
                className="notif-btn"
                onClick={() => onAlert?.("Notifications: 1 new message from Dr. Priya Sharma, 1 claim update.", "info")}
                title="Notifications"
                aria-label="Notifications"
              >
                🔔
                <span className="notif-badge">3</span>
              </button>
              <ThemeSwitch darkMode={darkMode} onToggle={toggleTheme} />
              <div
                className="topbar-user-pill"
                onClick={() => {
                  setShowProfileModal(true);
                  setIsSettingsOpen(false);
                }}
                role="button"
                tabIndex={0}
                title="View & Edit Health Profile"
              >
                <div className="topbar-user-avatar">
                  {(patientName || "D")[0].toUpperCase()}
                </div>
                <span className="topbar-user-name">{patientName || "Daksh"}</span>
              </div>
            </div>
          </header>
          <div className="content">
            {page === "overview" && (
              <section className="dash-overview-wrap">
                {/* Hero Welcome Banner */}
                <div className="dash-hero-banner">
                  <div className="dash-hero-text-col">
                    <h2 className="dash-hero-greeting">Hello, {patientName || "Daksh"} 👋</h2>
                    <div className="dash-hero-headline">Your health matters</div>
                    <p className="dash-hero-desc">
                      Stay on track with your upcoming consultations, insurance claims, and wellness goals.
                    </p>
                    <button
                      type="button"
                      className="dash-hero-btn"
                      onClick={() => showPage("appointments")}
                    >
                      Book Appointment →
                    </button>
                  </div>
                  <div className="dash-hero-right">
                    <div className="dash-hero-doctor-wrap">
                      <img
                        src="/hero-doctor.jpg"
                        alt="SwasthyaOne Healthcare Doctor"
                        className="dash-hero-doctor-img"
                      />
                    </div>
                    <div className="dash-hero-action-pills">
                      <button
                        type="button"
                        className="dash-hero-action-pill"
                        onClick={() => showPage("appointments")}
                      >
                        <span>📅</span> Book Appointments
                      </button>
                      <button
                        type="button"
                        className="dash-hero-action-pill"
                        onClick={() => showPage("insurance")}
                      >
                        <span>🛡️</span> Track Claims
                      </button>
                      <button
                        type="button"
                        className="dash-hero-action-pill"
                        onClick={() => showPage("documents")}
                      >
                        <span>📄</span> Access Records
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 KPI Summary Cards Row */}
                <div className="dash-kpi-grid">
                  <div
                    className="dash-kpi-card kpi-blue"
                    onClick={() => showPage("appointments")}
                    role="button"
                    tabIndex={0}
                    title="Click to view Appointment Details"
                  >
                    <div className="dash-kpi-header">
                      <div className="dash-kpi-icon blue">📅</div>
                    </div>
                    <div className="dash-kpi-label">Next Appointment</div>
                    <div className="dash-kpi-value">Tomorrow</div>
                    <div className="dash-kpi-sub">Dr. Priya Sharma • 10:30 AM</div>
                    <button
                      type="button"
                      className="dash-kpi-footer-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPage("appointments");
                      }}
                    >
                      View Details →
                    </button>
                  </div>

                  <div
                    className="dash-kpi-card kpi-green"
                    onClick={() => showPage("insurance")}
                    role="button"
                    tabIndex={0}
                    title="Click to view Insurance Claims"
                  >
                    <div className="dash-kpi-header">
                      <div className="dash-kpi-icon green">🛡️</div>
                    </div>
                    <div className="dash-kpi-label">Insurance Claims</div>
                    <div className="dash-kpi-value">{claims.length} Active</div>
                    <div className="dash-kpi-sub">1 Approved • 1 In Review</div>
                    <button
                      type="button"
                      className="dash-kpi-footer-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPage("insurance");
                      }}
                    >
                      Track Status →
                    </button>
                  </div>

                  <div
                    className="dash-kpi-card kpi-purple"
                    onClick={() => showPage("documents")}
                    role="button"
                    tabIndex={0}
                    title="Click to view Medical Records"
                  >
                    <div className="dash-kpi-header">
                      <div className="dash-kpi-icon purple">📄</div>
                    </div>
                    <div className="dash-kpi-label">Medical Records</div>
                    <div className="dash-kpi-value">{documents.length || 5} Files</div>
                    <div className="dash-kpi-sub">Last uploaded 2 days ago</div>
                    <button
                      type="button"
                      className="dash-kpi-footer-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPage("documents");
                      }}
                    >
                      Access Files →
                    </button>
                  </div>

                  <div
                    className="dash-kpi-card kpi-salmon"
                    onClick={() => showPage("prescriptions")}
                    role="button"
                    tabIndex={0}
                    title="Click to view Active Prescriptions"
                  >
                    <div className="dash-kpi-header">
                      <div className="dash-kpi-icon salmon">💊</div>
                    </div>
                    <div className="dash-kpi-label">Active Prescriptions</div>
                    <div className="dash-kpi-value">{prescriptions.filter(p => p.status === "Active" || p.status === "Refill Due").length} Active</div>
                    <div className="dash-kpi-sub">1 Refill Due • Verified</div>
                    <button
                      type="button"
                      className="dash-kpi-footer-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPage("prescriptions");
                      }}
                    >
                      View Refills →
                    </button>
                  </div>
                </div>

                {/* 2-Column Split Layout */}
                <div className="dash-split-layout">
                  {/* Left Column (Charts, Donut, Prescriptions, Medical Records) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    {/* Health Overview Multi-line Chart */}
                    <div className="dash-card card-health-overview">
                      <div className="dash-card-header">
                        <h3>Your Health Overview</h3>
                        <div className="dash-chart-controls">
                          <div className="dash-chart-legend">
                            <span><span className="legend-dot steps"></span>Steps</span>
                            <span><span className="legend-dot heart"></span>Heart Rate</span>
                            <span><span className="legend-dot sleep"></span>Sleep</span>
                          </div>
                          <div className="dash-time-tabs">
                            <button
                              type="button"
                              className={`dash-time-tab ${overviewRange === "7d" ? "active" : ""}`}
                              onClick={() => setOverviewRange("7d")}
                            >
                              7 Days
                            </button>
                            <button
                              type="button"
                              className={`dash-time-tab ${overviewRange === "30d" ? "active" : ""}`}
                              onClick={() => setOverviewRange("30d")}
                            >
                              30 Days
                            </button>
                            <button
                              type="button"
                              className={`dash-time-tab ${overviewRange === "3m" ? "active" : ""}`}
                              onClick={() => setOverviewRange("3m")}
                            >
                              3 Months
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="dash-chart-container">
                        {(() => {
                          const activeDs = chartDatasets[overviewRange] || chartDatasets["7d"];
                          const cW = 580;
                          const cH = 210;
                          const pL = 36;
                          const pR = 20;
                          const pT = 20;
                          const pB = 30;
                          const pW = cW - pL - pR;
                          const pH = cH - pT - pB;
                          const n = activeDs.labels.length;
                          const getX = (idx) => pL + (idx / Math.max(1, n - 1)) * pW;
                          const getStepY = (v) => pT + pH - Math.max(0, Math.min(pH, ((v - 5000) / 7000) * pH));
                          const getHeartY = (v) => pT + pH - Math.max(0, Math.min(pH, ((v - 60) / 25) * pH));
                          const getSleepY = (v) => pT + pH - Math.max(0, Math.min(pH, ((v - 5) / 5) * pH));

                          const sPts = activeDs.steps.map((v, i) => ({ x: getX(i), y: getStepY(v), val: v }));
                          const hPts = activeDs.heart.map((v, i) => ({ x: getX(i), y: getHeartY(v), val: v }));
                          const slPts = activeDs.sleep.map((v, i) => ({ x: getX(i), y: getSleepY(v), val: v }));

                          const toPath = (pts) => pts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
                          const toArea = (pts) => {
                            if (!pts.length) return "";
                            const line = toPath(pts);
                            return `${line} L ${pts[pts.length - 1].x} ${pT + pH} L ${pts[0].x} ${pT + pH} Z`;
                          };

                          return (
                            <svg width="100%" height="210" viewBox={`0 0 ${cW} ${cH}`} style={{ overflow: "visible" }}>
                              <defs>
                                <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00a896" stopOpacity="0.28" />
                                  <stop offset="100%" stopColor="#00a896" stopOpacity="0.01" />
                                </linearGradient>
                                <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              {[0, 0.33, 0.66, 1].map((pct, i) => {
                                const yPos = pT + pH * pct;
                                return (
                                  <line
                                    key={i}
                                    x1={pL}
                                    y1={yPos}
                                    x2={pL + pW}
                                    y2={yPos}
                                    stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                                    strokeDasharray="4 4"
                                  />
                                );
                              })}
                              <path d={toArea(sPts)} fill="url(#stepGrad)" />
                              <path d={toPath(sPts)} fill="none" stroke="#00a896" strokeWidth="2.5" strokeLinecap="round" />
                              <path d={toPath(hPts)} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
                              <path d={toPath(slPts)} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 3" />
                              {sPts.map((p, i) => (
                                <circle key={`s-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#00a896" stroke="#ffffff" strokeWidth="2">
                                  <title>{`${activeDs.labels[i]}: ${p.val.toLocaleString()} steps`}</title>
                                </circle>
                              ))}
                              {hPts.map((p, i) => (
                                <circle key={`h-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5">
                                  <title>{`${activeDs.labels[i]}: ${p.val} bpm`}</title>
                                </circle>
                              ))}
                              {activeDs.labels.map((lbl, i) => (
                                <text
                                  key={lbl}
                                  x={getX(i)}
                                  y={pT + pH + 20}
                                  textAnchor="middle"
                                  fontSize="11.5"
                                  fontWeight="600"
                                  fill={darkMode ? "#94a3b8" : "#64748b"}
                                >
                                  {lbl}
                                </text>
                              ))}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Middle Sub-Grid: Donut Claim Status + Active Prescriptions */}
                    <div className="dash-sub-grid">
                      {/* Donut Chart */}
                      <div className="dash-card card-claim-status">
                        <div className="dash-card-header">
                          <h3>Insurance Claim Status</h3>
                        </div>
                        <div className="dash-donut-wrap">
                          <svg width="130" height="130" viewBox="0 0 130 130">
                            <circle
                              cx="65"
                              cy="65"
                              r="46"
                              stroke={darkMode ? "#1e293b" : "#f1f5f9"}
                              strokeWidth="14"
                              fill="none"
                            />
                            <circle
                              cx="65"
                              cy="65"
                              r="46"
                              stroke="#10b981"
                              strokeWidth="14"
                              strokeDasharray="144.5 289"
                              strokeDashoffset="0"
                              fill="none"
                              transform="rotate(-90 65 65)"
                            />
                            <circle
                              cx="65"
                              cy="65"
                              r="46"
                              stroke="#f59e0b"
                              strokeWidth="14"
                              strokeDasharray="144.5 289"
                              strokeDashoffset="-144.5"
                              fill="none"
                              transform="rotate(-90 65 65)"
                            />
                            <text
                              x="65"
                              y="61"
                              textAnchor="middle"
                              fontWeight="900"
                              fontSize="20"
                              fill={darkMode ? "#ffffff" : "#0f2b48"}
                            >
                              2
                            </text>
                            <text
                              x="65"
                              y="76"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748b"
                              fontWeight="700"
                            >
                              Claims
                            </text>
                          </svg>
                          <div className="donut-legend-col">
                            <div className="donut-legend-item">
                              <span className="donut-status-dot approved"></span>
                              <span>Approved (1) • 50%</span>
                            </div>
                            <div className="donut-legend-item">
                              <span className="donut-status-dot pending"></span>
                              <span>In Review (1) • 50%</span>
                            </div>
                            <div className="donut-legend-item">
                              <span className="donut-status-dot rejected"></span>
                              <span>Rejected (0) • 0%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Prescriptions */}
                      <div className="dash-card card-prescriptions">
                        <div className="dash-card-header">
                          <h3>Active Prescriptions</h3>
                          <button
                            type="button"
                            className="dash-card-header-link"
                            onClick={() => showPage("prescriptions")}
                          >
                            View All
                          </button>
                        </div>
                        <div className="dash-rx-list">
                          {prescriptions.slice(0, 2).map((rx) => (
                            <div
                              key={rx.id}
                              className="dash-rx-item"
                              onClick={() => showPage("prescriptions")}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="dash-rx-icon">💊</div>
                              <div className="dash-rx-info">
                                <div className="dash-rx-name">{rx.name} {rx.dosage}</div>
                                <div className="dash-rx-dosage">{rx.frequency} • {rx.daysLeft > 0 ? `${rx.daysLeft} days left` : "Refill due"}</div>
                              </div>
                              <span className={`dash-rx-badge ${rx.status === "Refill Due" ? "refill" : ""}`}>{rx.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Medical Records Table */}
                    <div className="dash-card card-medical-records">
                      <div className="dash-card-header">
                        <h3>Recent Medical Records</h3>
                        <button
                          type="button"
                          className="dash-card-header-link"
                          onClick={() => showPage("documents")}
                        >
                          View All
                        </button>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table className="dash-records-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Record Type</th>
                              <th>Doctor</th>
                              <th>Description</th>
                              <th style={{ textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { date: "18 Oct 2026", type: "🩸 Blood Test Report", doc: "Dr. Priya Sharma", desc: "Complete Hemogram & Lipid Profile" },
                              { date: "12 Oct 2026", type: "💊 Prescription Slip", doc: "Dr. Rahul Mehta", desc: "Hypertension & Lifestyle Advisory" },
                              { date: "04 Oct 2026", type: "🩻 Radiology Scan", doc: "Dr. Sneha Kapoor", desc: "Chest X-Ray (Normal)" },
                            ].map((rec, i) => (
                              <tr key={i}>
                                <td style={{ whiteSpace: "nowrap", fontWeight: "600" }}>{rec.date}</td>
                                <td
                                  style={{ fontWeight: "700", cursor: "pointer", color: "var(--accent)" }}
                                  onClick={() => {
                                    if (rec.type.includes("Blood") || rec.type.includes("Scan")) showPage("lab-reports");
                                    else if (rec.type.includes("Prescription")) showPage("prescriptions");
                                    else showPage("documents");
                                  }}
                                  title="Click to view in records"
                                >
                                  {rec.type}
                                </td>
                                <td>{rec.doc}</td>
                                <td style={{ color: "#64748b" }}>{rec.desc}</td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="dash-download-icon-btn"
                                    title={`Download ${rec.type} to library`}
                                    onClick={() => {
                                      downloadMedicalRecord(rec, patientName || "Aarav Sharma");
                                      onAlert?.(`Downloaded ${rec.type} to your device library / downloads folder!`, "success");
                                    }}
                                  >
                                    ⬇️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Quick Actions, Upcoming Appointments, Health Goals) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    {/* Quick Actions */}
                    <div className="dash-card card-quick-actions">
                      <div className="dash-card-header">
                        <h3>Quick Actions</h3>
                      </div>
                      <div className="dash-quick-grid">
                        <div
                          className="dash-quick-tile"
                          onClick={() => showPage("appointments")}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="dash-quick-icon">📅</div>
                          <div className="dash-quick-label">Book Appointment</div>
                        </div>
                        <div
                          className="dash-quick-tile"
                          onClick={() => showPage("insurance")}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="dash-quick-icon">🛡️</div>
                          <div className="dash-quick-label">Claim Insurance</div>
                        </div>
                        <div
                          className="dash-quick-tile"
                          onClick={() => showPage("documents")}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="dash-quick-icon">📁</div>
                          <div className="dash-quick-label">Upload Records</div>
                        </div>
                        <div
                          className="dash-quick-tile"
                          onClick={() => showPage("doctors")}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="dash-quick-icon">🩺</div>
                          <div className="dash-quick-label">Find Doctors</div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="dash-card card-appointments">
                      <div className="dash-card-header">
                        <h3>Upcoming Appointments</h3>
                        <button
                          type="button"
                          className="dash-card-header-link"
                          onClick={() => showPage("appointments")}
                        >
                          See All
                        </button>
                      </div>
                      <div className="dash-appointments-list">
                        <div className="dash-apt-item">
                          <div className="dash-doc-avatar">PS</div>
                          <div className="dash-apt-info">
                            <div className="dash-doc-name">Dr. Priya Sharma</div>
                            <div className="dash-doc-spec">Cardiology • Apollo Hospital</div>
                            <div className="dash-doc-time">📅 Tomorrow, 10:30 AM</div>
                          </div>
                          <span className="dash-status-pill confirmed">Confirmed</span>
                        </div>
                        <div className="dash-apt-item">
                          <div className="dash-doc-avatar" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>RM</div>
                          <div className="dash-apt-info">
                            <div className="dash-doc-name">Dr. Rahul Mehta</div>
                            <div className="dash-doc-spec">Neurology • Max Healthcare</div>
                            <div className="dash-doc-time">📅 24 Oct, 03:00 PM</div>
                          </div>
                          <span className="dash-status-pill scheduled">Scheduled</span>
                        </div>
                        <div className="dash-apt-item">
                          <div className="dash-doc-avatar" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>SK</div>
                          <div className="dash-apt-info">
                            <div className="dash-doc-name">Dr. Sneha Kapoor</div>
                            <div className="dash-doc-spec">Dermatology • Fortis Care</div>
                            <div className="dash-doc-time">📅 28 Oct, 11:30 AM</div>
                          </div>
                          <span className="dash-status-pill scheduled">Scheduled</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Goals Widget */}
                    <div className="dash-card card-health-goals">
                      <div className="dash-card-header">
                        <h3>Health Goals</h3>
                      </div>
                      <div className="dash-goals-wrap">
                        <div className="dash-radial-meter">
                          <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              stroke={darkMode ? "#1e293b" : "#e2e8f0"}
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              stroke="#00a896"
                              strokeWidth="8"
                              strokeDasharray="238.7"
                              strokeDashoffset="71.6"
                              strokeLinecap="round"
                              fill="none"
                              transform="rotate(-90 50 50)"
                            />
                            <text
                              x="50"
                              y="55"
                              textAnchor="middle"
                              fontWeight="900"
                              fontSize="18"
                              fill={darkMode ? "#ffffff" : "#0f2b48"}
                            >
                              70%
                            </text>
                          </svg>
                        </div>
                        <div className="dash-goals-info">
                          <div className="dash-goal-num">7,000 / 10,000 steps</div>
                          <div className="dash-goal-sub">Weekly Target Achieved • Keep moving!</div>
                        </div>
                      </div>
                      <div className="dash-progress-track">
                        <div className="dash-prog-item">
                          <div className="dash-prog-header">
                            <span>💧 Daily Water Intake</span>
                            <span>2.1L / 3.0L (70%)</span>
                          </div>
                          <div className="dash-prog-bar-wrap">
                            <div className="dash-prog-bar water" style={{ width: "70%" }}></div>
                          </div>
                        </div>
                        <div className="dash-prog-item">
                          <div className="dash-prog-header">
                            <span>🌙 Sleep Quality</span>
                            <span>7.5h / 8.0h (93%)</span>
                          </div>
                          <div className="dash-prog-bar-wrap">
                            <div className="dash-prog-bar sleep" style={{ width: "93%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {page === "appointments" && (
              <section className="page">
                <h1>Appointments 📅</h1>
                <p className="muted">Manage your doctor visits and schedule new consultations.</p>
                <div className="card">
                  <h3>Book an Appointment</h3>
                  <form className="form" onSubmit={addAppointment}>
                    <label>
                      <span>Patient Name</span>
                      <input
                        type="text"
                        placeholder="Enter full patient name"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          onUpdateUserName?.(e.target.value);
                        }}
                        required
                      />
                    </label>

                    <label>
                      <span>Select Doctor</span>
                      <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
                        {doctors.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} ({d.specialty}) · {formatMoney(d.fee, currency)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="fee-highlight-box">
                      <span>Consultation Fee:</span>
                      <strong>{formatMoney(selectedDoctor.fee, currency)}</strong>
                    </div>

                    <div className="form-row-2">
                      <label>
                        <span>Appointment Date</span>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span>Time Slot</span>
                        <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)}>
                          {["10:30 AM", "12:00 PM", "3:30 PM", "4:00 PM"].map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label>
                      <span>Payment Mode</span>
                      <select
                        value={appointmentPaymentMode}
                        onChange={(e) => setAppointmentPaymentMode(e.target.value)}
                      >
                        <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                        <option value="Credit / Debit Card">Credit / Debit Card (Visa, RuPay)</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cash at Clinic">Pay Cash at Clinic</option>
                        <option value="Cashless Insurance">Cashless Insurance / TPA</option>
                      </select>
                    </label>

                    {/* Optional Medical Reports & Scans Upload for Doctor */}
                    <div className="insurance-upload-section" style={{ marginTop: 14 }}>
                      <div className="insurance-upload-title-row">
                        <span className="insurance-upload-label-text">
                          📁 Attach Medical Reports & Scans for Doctor
                        </span>
                        <span className="insurance-optional-pill" style={{ background: "rgba(2,132,199,0.12)", color: "#0284c7" }}>Optional</span>
                      </div>
                      <div className="insurance-dropzone" style={{ borderColor: aptReports.length > 0 ? "rgba(2,132,199,0.45)" : undefined }}>
                        <input
                          type="file"
                          id="aptReportFilesInput"
                          accept="image/*,application/pdf"
                          multiple
                          onChange={handleAptReportUpload}
                          style={{ display: "none" }}
                        />
                        <div
                          className="insurance-dropzone-inner"
                          onClick={() => document.getElementById("aptReportFilesInput")?.click()}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="insurance-dropzone-icon" style={{ background: "rgba(2,132,199,0.12)", color: "#0284c7" }}>📂</span>
                          <div>
                            <strong>Click or tap to attach photos of reports, blood tests or X-rays</strong>
                            <p className="insurance-dropzone-sub">
                              Doctor will review these files before and during your consultation • Optional
                            </p>
                          </div>
                        </div>
                        {aptReports.length > 0 && (
                          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                            {aptReports.map((rep) => (
                              <div key={rep.id} className="insurance-file-preview-card" style={{ padding: "8px 14px" }}>
                                <div className="insurance-thumb-wrap" style={{ width: 44, height: 44 }}>
                                  <img src={rep.preview} alt={rep.name} className="insurance-thumb-img" />
                                </div>
                                <div className="insurance-preview-details">
                                  <strong className="insurance-preview-filename">{rep.name}</strong>
                                  <span className="insurance-preview-filesize">{rep.size} • {rep.type}</span>
                                  <span className="insurance-preview-tag" style={{ background: "rgba(2,132,199,0.12)", color: "#0284c7" }}>✓ Ready for Doctor</span>
                                </div>
                                <div className="insurance-preview-actions">
                                  <button
                                    type="button"
                                    className="btn btn-light"
                                    style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "8px" }}
                                    onClick={() => setViewingInsuranceDoc({ name: rep.name, preview: rep.preview, size: rep.size, isMedical: true })}
                                  >
                                    👁️ Preview
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-remove-attachment"
                                    onClick={() => handleRemoveAptReport(rep.id)}
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="btn">
                      Confirm Booking
                    </button>
                  </form>
                  <div className="notice"></div>
                </div>
                <div className="card">
                  <h3>All Appointments</h3>
                  {upcoming.length ? upcoming : <p>No appointments yet.</p>}
                </div>
              </section>
            )}

            {page === "doctors" && <section className="page doctors-page-section">
              <div className="doctors-header-row">
                <div>
                  <h1>Find a Doctor 🩺</h1>
                  <p className="muted">Choose a specialist for your appointment.</p>
                </div>
                <div className="doctors-count-badge">
                  <span className="doctors-pulse-dot"></span>
                  <span>4 Verified Doctors Available</span>
                </div>
              </div>

              <div className="doctor-cards-row">
                {doctors.map((doctor) => {
                  const avatarSrc = doctor.avatar || getDoctorProfile(doctor.name).avatar || "/doctor-meera.jpg";
                  return (
                    <div key={doctor.name} className="doctor-item-card">
                      <div className="doctor-card-avatar-wrap">
                        <img
                          src={avatarSrc}
                          alt={doctor.name}
                          className="doctor-card-avatar"
                          onError={(e) => {
                            e.currentTarget.src = (doctor.name.includes("Meera") || doctor.name.includes("Meena") || doctor.name.includes("Aisha"))
                              ? "/doctor-meera.jpg"
                              : "/doctor-rohan.jpg";
                          }}
                        />
                        <span className="doctor-card-status-dot" title="Available for consultation"></span>
                      </div>
                      
                      <h3 className="doctor-card-name">{doctor.name}</h3>
                      <div className="doctor-card-specialty">{doctor.specialty}</div>
                      <p className="doctor-card-clinic">📍 {doctor.clinic}</p>
                      
                      <div className="doctor-card-stats">
                        <span className="doctor-stat-rating">⭐ {doctor.rating || "4.9"}</span>
                        <span className="doctor-stat-sep">•</span>
                        <span className="doctor-stat-exp">💼 {doctor.experience || "10+ yrs"}</span>
                      </div>

                      <div className="doctor-card-fee">
                        <span className="doctor-fee-title">Consultation fee:</span>
                        <strong className="doctor-fee-amount">{formatMoney(doctor.fee, currency)}</strong>
                      </div>

                      <button
                        type="button"
                        className="btn doctor-card-book-btn"
                        onClick={() => bookDoctor(doctor.name)}
                      >
                        Book
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>}

            {page === "payments" && <section className="page">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h1>Payments 💳</h1>
                  <p className="muted">View your payment records and switch payment methods.</p>
                </div>
                <button className="btn" onClick={() => setShowAddPaymentModal(true)}>+ Make a Payment</button>
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Payment History</h3>
                  <div className="topbar-currency-wrap">
                    <span className="currency-globe-icon">🌐</span>
                    <select
                      className="topbar-currency-select"
                      value={currency}
                      onChange={(e) => onCurrencyChange?.(e.target.value)}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                </div>

                {paymentRows}

                <div style={{ marginTop: 15 }}>
                  <button className="btn-light" onClick={() => setShowAddPaymentModal(true)}>+ Add Payment</button>
                </div>
                <div className="notice">Money is collected. All amounts convert dynamically with currency.</div>
              </div>

              {showAddPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowAddPaymentModal(false)}>
                  <div className="contact-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
                    <div className="contact-modal-header">
                      <div>
                        <h3>Make Payment</h3>
                        <p>Simulate a healthcare bill payment</p>
                      </div>
                      <button className="modal-close-btn" onClick={() => setShowAddPaymentModal(false)}>✕</button>
                    </div>
                    <form className="contact-form" style={{ padding: "24px 30px" }} onSubmit={handleCreatePayment}>
                      <label>
                        Payment Title / Description
                        <input
                          value={newPayTitle}
                          onChange={(e) => setNewPayTitle(e.target.value)}
                          placeholder="e.g. Doctor Consultation or Blood Test"
                          required
                        />
                      </label>
                      <label>
                        Bill Amount (Base ₹ INR)
                        <input
                          type="number"
                          min="50"
                          step="50"
                          value={newPayAmount}
                          onChange={(e) => setNewPayAmount(e.target.value)}
                          required
                        />
                        <small className="muted">
                          Displays as: <strong>{formatMoney(newPayAmount, currency)}</strong>
                        </small>
                      </label>
                      <label>
                        Payment Mode / Method
                        <select value={newPayMode} onChange={(e) => setNewPayMode(e.target.value)}>
                          <option value="UPI (Google Pay)">UPI (Google Pay / PhonePe / Paytm)</option>
                          <option value="Credit Card (Visa)">Credit Card (Visa / Mastercard)</option>
                          <option value="Debit Card (RuPay)">Debit Card (RuPay / Maestro)</option>
                          <option value="Net Banking">Net Banking (SBI / HDFC / ICICI)</option>
                          <option value="Cash at Counter">Cash at Clinic Counter</option>
                          <option value="Insurance TPA Cashless">Insurance TPA Cashless</option>
                        </select>
                      </label>
                      <div className="contact-form-actions">
                        <button type="submit" className="start-btn">Pay {formatMoney(newPayAmount, currency)} Now</button>
                        <button type="button" className="login-btn" onClick={() => setShowAddPaymentModal(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>}

            {page === "insurance" && <section className="page">
              <h1>Insurance Claims ♧</h1>
              <p className="muted">Organize documents and prepare reimbursement records.</p>
              <div className="card">
                <h3>Create a Claim</h3>
                <form className="form" onSubmit={addClaim}>
                  <label>
                    <span>Claim Description</span>
                    <input
                      value={claimTitle}
                      onChange={(e) => setClaimTitle(e.target.value)}
                      placeholder="e.g. Doctor consultation or Lab Tests"
                      required
                    />
                  </label>
                  <label>
                    <span>Bill Amount (Base ₹ INR)</span>
                    <input
                      type="number"
                      min="1"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="Enter claim amount"
                      required
                    />
                    {claimAmount && (
                      <small className="muted" style={{ marginTop: 4 }}>
                        Amount in current currency: <strong>{formatMoney(claimAmount, currency)}</strong>
                      </small>
                    )}
                  </label>

                  {/* Photo / Image Attach Feature (Optional) */}
                  <div className="insurance-upload-section">
                    <div className="insurance-upload-title-row">
                      <span className="insurance-upload-label-text">📷 Attach Insurance Paper / Policy Document</span>
                      <span className="insurance-optional-pill">Optional</span>
                    </div>
                    <div className="insurance-dropzone">
                      <input
                        type="file"
                        id="claimPaperInput"
                        accept="image/*,application/pdf"
                        onChange={handleClaimPaperUpload}
                        style={{ display: "none" }}
                      />
                      {!claimPaperPreview ? (
                        <div
                          className="insurance-dropzone-inner"
                          onClick={() => document.getElementById("claimPaperInput")?.click()}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="insurance-dropzone-icon">📷</span>
                          <div>
                            <strong>Click or tap to upload photo of insurance paper</strong>
                            <p className="insurance-dropzone-sub">Attach insurance card, policy bill or reimbursement form • Optional</p>
                          </div>
                        </div>
                      ) : (
                        <div className="insurance-file-preview-card">
                          <div className="insurance-thumb-wrap">
                            <img src={claimPaperPreview} alt="Insurance Paper Preview" className="insurance-thumb-img" />
                          </div>
                          <div className="insurance-preview-details">
                            <strong className="insurance-preview-filename">{claimPaperName}</strong>
                            <span className="insurance-preview-filesize">{claimPaperSize}</span>
                            <span className="insurance-preview-tag">✓ Ready to submit with claim</span>
                          </div>
                          <div className="insurance-preview-actions">
                            <button
                              type="button"
                              className="btn btn-light"
                              style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "8px" }}
                              onClick={() => setViewingInsuranceDoc({ name: claimPaperName, preview: claimPaperPreview })}
                            >
                              👁️ Preview
                            </button>
                            <button
                              type="button"
                              className="btn-remove-attachment"
                              onClick={() => {
                                setClaimPaper(null);
                                setClaimPaperName("");
                                setClaimPaperPreview(null);
                                setClaimPaperSize("");
                              }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn">Create Claim</button>
                </form>
              </div>
              <div className="card">
                <h3>Claim Tracker</h3>
                {claimRows}
                <h3>Document Checklist</h3>
                {["Hospital bill", "Payment receipt", "Prescription, if required", "Other insurer-required documents"].map((item, i) =>
                  <label className="check-row" key={item}>
                    <input
                      type="checkbox"
                      checked={checklist[i]}
                      onChange={(e) => setChecklist((old) => old.map((v, index) => index === i ? e.target.checked : v))}
                    /> {item}
                  </label>
                )}
                <button
                  className="btn"
                  onClick={() =>
                    setCheckResult(
                      checklist.every(Boolean)
                        ? "All checklist items are marked. Verify insurer requirements."
                        : `${checklist.filter((v) => !v).length} checklist item(s) are still unchecked.`
                    )
                  }
                >
                  Check Documents
                </button>
                {checkResult && <p className="muted">{checkResult}</p>}
                <div className="notice">A checklist does not guarantee insurance eligibility or approval.</div>
              </div>
            </section>}

            {page === "documents" && <section className="page">
              <h1>My Documents 📁</h1>
              <p className="muted">Your healthcare document library.</p>
              <div className="card">
                <h3>Sample Documents</h3>
                {documentRows}
                <button
                  className="btn"
                  onClick={() => {
                    setDocuments((old) => [...old, "New Sample Document.pdf"]);
                    onAlert?.("A sample entry was added. Real file upload is not enabled.", "info");
                  }}
                >
                  + Add Document
                </button>
                <div className="notice">This website does not upload or securely store real files.</div>
              </div>
            </section>}

            {page === "prescriptions" && (
              <section className="page rx-page-section">
                <div className="rx-page-header">
                  <div>
                    <h1>Prescriptions 💊</h1>
                    <p className="muted">Manage your active medications, refill schedules, and digital doctor prescriptions.</p>
                  </div>
                  <div className="rx-header-actions">
                    <button
                      type="button"
                      className="btn rx-add-btn"
                      onClick={() => setShowAddRxModal(true)}
                    >
                      + Add Prescription
                    </button>
                    <button
                      type="button"
                      className="btn btn-light rx-download-all-btn"
                      onClick={() => {
                        downloadAllPrescriptionsSummaryPDF(prescriptions, patientName || "Aarav Sharma");
                        onAlert?.("Downloaded comprehensive prescription summary (PDF) to your device library!", "success");
                      }}
                    >
                      📥 Download Summary
                    </button>
                  </div>
                </div>

                {/* 4 Summary KPI Cards */}
                <div className="rx-stats-grid">
                  <div className="rx-stat-card rx-kpi-green">
                    <div className="rx-stat-icon">💊</div>
                    <div className="rx-stat-content">
                      <div className="rx-stat-num">{prescriptions.filter((p) => p.status === "Active").length}</div>
                      <div className="rx-stat-label">Active Medications</div>
                      <div className="rx-stat-sub">Regimen on schedule</div>
                    </div>
                  </div>
                  <div className="rx-stat-card rx-kpi-amber">
                    <div className="rx-stat-icon">⏳</div>
                    <div className="rx-stat-content">
                      <div className="rx-stat-num">{prescriptions.filter((p) => p.status.includes("Refill")).length}</div>
                      <div className="rx-stat-label">Refill Due Soon</div>
                      <div className="rx-stat-sub">Refill within 12 days</div>
                    </div>
                  </div>
                  <div className="rx-stat-card rx-kpi-blue">
                    <div className="rx-stat-icon">🎯</div>
                    <div className="rx-stat-content">
                      <div className="rx-stat-num">96%</div>
                      <div className="rx-stat-label">Adherence Score</div>
                      <div className="rx-stat-sub">Consistent timing</div>
                    </div>
                  </div>
                  <div className="rx-stat-card rx-kpi-purple">
                    <div className="rx-stat-icon">🏥</div>
                    <div className="rx-stat-content">
                      <div className="rx-stat-num">{doctors.length}</div>
                      <div className="rx-stat-label">Consulting Doctors</div>
                      <div className="rx-stat-sub">Verified e-prescriptions</div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="rx-filter-bar">
                  {[
                    { id: "all", label: `All Prescriptions (${prescriptions.length})` },
                    { id: "Active", label: `Active (${prescriptions.filter((p) => p.status === "Active").length})` },
                    { id: "Refill Due", label: `Refill Due (${prescriptions.filter((p) => p.status.includes("Refill")).length})` },
                    { id: "Completed", label: `Completed (${prescriptions.filter((p) => p.status === "Completed").length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`rx-tab-pill ${rxFilter === tab.id ? "active" : ""}`}
                      onClick={() => setRxFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Prescription Cards Grid */}
                <div className="rx-cards-grid">
                  {filteredPrescriptions.map((rx) => (
                    <div key={rx.id} className="rx-item-card">
                      <div className="rx-card-top">
                        <div className="rx-pill-badge-wrap">
                          <span className="rx-pill-symbol">💊</span>
                          <div>
                            <h3 className="rx-med-name">{rx.name}</h3>
                            <div className="rx-med-dosage">{rx.dosage} • {rx.type}</div>
                          </div>
                        </div>
                        <span className={`rx-status-tag ${rx.status.toLowerCase().replace(/[^a-z]/g, "-")}`}>
                          {rx.status}
                        </span>
                      </div>

                      <div className="rx-category-tag">{rx.category}</div>

                      <div className="rx-details-box">
                        <div className="rx-detail-row">
                          <span className="rx-detail-label">Prescribed by:</span>
                          <strong>{rx.doctor}</strong>
                        </div>
                        <div className="rx-detail-row">
                          <span className="rx-detail-label">Frequency:</span>
                          <span>{rx.frequency}</span>
                        </div>
                        <div className="rx-detail-row">
                          <span className="rx-detail-label">Schedule:</span>
                          <span className="rx-schedule-tag">⏰ {rx.schedule}</span>
                        </div>
                        <div className="rx-detail-row">
                          <span className="rx-detail-label">Duration:</span>
                          <span>{rx.startDate} → {rx.endDate}</span>
                        </div>
                      </div>

                      {rx.totalDays > 0 && rx.status !== "Completed" && (
                        <div className="rx-progress-wrap">
                          <div className="rx-progress-header">
                            <span>Course Progress</span>
                            <strong>{rx.daysLeft} days remaining</strong>
                          </div>
                          <div className="rx-progress-track">
                            <div
                              className="rx-progress-fill"
                              style={{ width: `${Math.max(10, Math.min(100, Math.round(((rx.totalDays - rx.daysLeft) / rx.totalDays) * 100)))}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="rx-instructions-note">
                        ℹ️ <em>{rx.instructions}</em>
                      </div>

                      <div className="rx-pharmacy-row">
                        <span>📍 {rx.pharmacy}</span>
                        <span>Refills: <strong>{rx.refillsLeft}</strong></span>
                      </div>

                      <div className="rx-card-actions">
                        <button
                          type="button"
                          className="btn rx-dose-btn"
                          onClick={() => handleMarkTaken(rx.id, rx.name)}
                        >
                          ✓ Log Dose
                        </button>
                        {rx.status.includes("Refill") ? (
                          <button
                            type="button"
                            className="btn rx-refill-btn"
                            onClick={() => handleRequestRefill(rx.id, rx.name)}
                          >
                            🔄 Request Refill
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-light rx-download-btn"
                            onClick={() => handleDownloadRx(rx)}
                          >
                            📄 Download Rx
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {page === "lab-reports" && (
              <section className="page lab-page-section">
                <div className="lab-page-header">
                  <div>
                    <h1>Lab Reports & Diagnostics 🧪</h1>
                    <p className="muted">Track clinical bio-markers, pathology blood tests, and radiology scans.</p>
                  </div>
                  <div className="lab-header-actions">
                    <button
                      type="button"
                      className="btn lab-book-btn"
                      onClick={() => setShowBookLabModal(true)}
                    >
                      + Book Lab Test
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        downloadAllLabsSummaryPDF(labReports, patientName || "Aarav Sharma");
                        onAlert?.("Downloaded complete cumulative diagnostic report (PDF) to your device library!", "success");
                      }}
                    >
                      📥 Export All PDF
                    </button>
                  </div>
                </div>

                {/* 4 Summary KPI Cards */}
                <div className="lab-stats-grid">
                  <div className="lab-stat-card lab-kpi-cyan">
                    <div className="lab-stat-icon">🧪</div>
                    <div className="lab-stat-content">
                      <div className="lab-stat-num">{labReports.length}</div>
                      <div className="lab-stat-label">Completed Tests</div>
                      <div className="lab-stat-sub">100% digital verified</div>
                    </div>
                  </div>
                  <div className="lab-stat-card lab-kpi-green">
                    <div className="lab-stat-icon">✅</div>
                    <div className="lab-stat-content">
                      <div className="lab-stat-num">94%</div>
                      <div className="lab-stat-label">Normal Limits</div>
                      <div className="lab-stat-sub">Optimal biomarkers</div>
                    </div>
                  </div>
                  <div className="lab-stat-card lab-kpi-amber">
                    <div className="lab-stat-icon">⚠️</div>
                    <div className="lab-stat-content">
                      <div className="lab-stat-num">1</div>
                      <div className="lab-stat-label">Attention Needed</div>
                      <div className="lab-stat-sub">Vitamin D3 Insufficient</div>
                    </div>
                  </div>
                  <div className="lab-stat-card lab-kpi-blue">
                    <div className="lab-stat-icon">🔬</div>
                    <div className="lab-stat-content">
                      <div className="lab-stat-num">4</div>
                      <div className="lab-stat-label">Partner Labs</div>
                      <div className="lab-stat-sub">NABL & CAP accredited</div>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="lab-toolbar-row">
                  <div className="lab-filter-pills">
                    {[
                      "all",
                      "Hematology",
                      "Biochemistry",
                      "Diabetology",
                      "Vitamins",
                      "Radiology",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`lab-tab-pill ${labFilter === cat ? "active" : ""}`}
                        onClick={() => setLabFilter(cat)}
                      >
                        {cat === "all" ? `All (${labReports.length})` : cat}
                      </button>
                    ))}
                  </div>
                  <div className="lab-search-wrap">
                    <span className="lab-search-icon">🔍</span>
                    <input
                      type="text"
                      className="lab-search-input"
                      placeholder="Search tests, labs, doctors..."
                      value={labSearch}
                      onChange={(e) => setLabSearch(e.target.value)}
                    />
                    {labSearch && (
                      <button
                        type="button"
                        className="lab-search-clear"
                        onClick={() => setLabSearch("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Lab Reports Grid */}
                <div className="lab-reports-grid">
                  {filteredLabReports.map((report) => (
                    <div key={report.id} className="lab-report-card">
                      <div className="lab-report-top">
                        <div className="lab-title-wrap">
                          <span className="lab-test-icon">
                            {report.category === "Radiology" ? "🩻" : report.category === "Hematology" ? "🩸" : "🧪"}
                          </span>
                          <div>
                            <h3 className="lab-test-name">{report.testName}</h3>
                            <div className="lab-meta-sub">
                              <span>📅 {report.date}</span> • <span>🔬 {report.labName}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`lab-status-tag ${report.status.toLowerCase()}`}>
                          {report.status === "Normal" ? "✓ Normal" : report.status === "Pending" ? "⏳ Scheduled" : "⚠️ Needs Review"}
                        </span>
                      </div>

                      <div className="lab-doctor-spec">
                        <span>Ordered by: <strong>{report.doctor}</strong></span>
                        <span className="lab-sample-pill">{report.sampleType}</span>
                      </div>

                      <div className="lab-summary-callout">
                        {report.summary}
                      </div>

                      {/* Key Biomarkers Table */}
                      <div className="lab-metrics-table-wrap">
                        <table className="lab-metrics-table">
                          <thead>
                            <tr>
                              <th>Parameter</th>
                              <th>Result</th>
                              <th>Reference Range</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.metrics.map((m, idx) => (
                              <tr key={idx}>
                                <td className="lab-metric-name">{m.name}</td>
                                <td className="lab-metric-val">
                                  <strong>{m.value}</strong>
                                </td>
                                <td className="lab-metric-ref">{m.ref}</td>
                                <td>
                                  <span className={`lab-metric-indicator ${m.status}`}>
                                    {m.status === "normal" ? "Normal" : m.status === "low" ? "Low" : "Borderline"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="lab-card-footer">
                        <div className="lab-file-info">
                          <span>📎 {report.fileName}</span>
                          <small>({report.fileSize})</small>
                        </div>
                        <div className="lab-btn-group">
                          <button
                            type="button"
                            className="btn btn-light lab-details-btn"
                            onClick={() => setSelectedLabReport(report)}
                          >
                            👁️ View Details
                          </button>
                          <button
                            type="button"
                            className="btn lab-dl-btn"
                            onClick={() => handleDownloadLab(report)}
                          >
                            ⬇️ Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <footer className="dash-footer">
            <div>✚ <strong>SwasthyaOne</strong> | Better Care • Healthier You</div>
            <div className="dash-footer-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); onAlert?.("SwasthyaOne complies with national health data privacy guidelines.", "info"); }}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); onAlert?.("Terms of service are in demo mode.", "info"); }}>Terms of Service</a>
              <a href="#help" onClick={(e) => { e.preventDefault(); onAlert?.("For help, contact support@swasthyaone.in or call 1800-SWASTHYA.", "info"); }}>Help Center</a>
            </div>
          </footer>
        </main>
      </div>
      <button
        type="button"
        className="corner-back-btn"
        onClick={goBack}
        aria-label="Go back to previous screen"
        title="Go Back"
      >
        <span className="corner-back-icon">←</span>
        <span>Back</span>
      </button>

      {/* Add Prescription Modal */}
      {showAddRxModal && (
        <div className="modal-overlay" onClick={() => setShowAddRxModal(false)}>
          <div className="contact-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <div>
                <h3>Add Medication / e-Rx 💊</h3>
                <p>Register a prescription to your digital cabinet</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddRxModal(false)}>✕</button>
            </div>
            <form className="contact-form" style={{ padding: "24px 28px" }} onSubmit={handleAddPrescription}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Medication Name *
                  <input
                    value={newRxName}
                    onChange={(e) => setNewRxName(e.target.value)}
                    placeholder="e.g. Azithromycin"
                    required
                  />
                </label>
                <label>
                  Dosage & Strength
                  <input
                    value={newRxDosage}
                    onChange={(e) => setNewRxDosage(e.target.value)}
                    placeholder="e.g. 500 mg"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Medication Type
                  <select value={newRxType} onChange={(e) => setNewRxType(e.target.value)}>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup / Liquid">Syrup / Liquid</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Eye/Ear Drops</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </label>
                <label>
                  Medical Condition / Category
                  <input
                    value={newRxCategory}
                    onChange={(e) => setNewRxCategory(e.target.value)}
                    placeholder="e.g. Respiratory Infection"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Prescribed By
                  <select value={newRxDoctor} onChange={(e) => setNewRxDoctor(e.target.value)}>
                    {doctors.map((d) => (
                      <option key={d.name} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </label>
                <label>
                  Frequency
                  <select value={newRxFreq} onChange={(e) => setNewRxFreq(e.target.value)}>
                    <option value="Once daily (Morning)">Once daily (Morning)</option>
                    <option value="Once daily (Night)">Once daily (Night)</option>
                    <option value="Twice daily (After meals)">Twice daily (After meals)</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Course Duration (Days)
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newRxDays}
                    onChange={(e) => setNewRxDays(e.target.value)}
                  />
                </label>
                <label>
                  Fulfilling Pharmacy
                  <input
                    value={newRxPharmacy}
                    onChange={(e) => setNewRxPharmacy(e.target.value)}
                    placeholder="Pharmacy name"
                  />
                </label>
              </div>

              <label>
                Doctor Instructions / Notes
                <input
                  value={newRxInstructions}
                  onChange={(e) => setNewRxInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water after dinner"
                />
              </label>

              <div className="contact-form-actions">
                <button type="submit" className="start-btn">Save Prescription</button>
                <button type="button" className="login-btn" onClick={() => setShowAddRxModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookLabModal && (
        <div className="modal-overlay" onClick={() => setShowBookLabModal(false)}>
          <div className="contact-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <div>
                <h3>Book Diagnostic Test 🧪</h3>
                <p>NABL / CAP Accredited Diagnostic Partners</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowBookLabModal(false)}>✕</button>
            </div>
            <form className="contact-form" style={{ padding: "24px 28px" }} onSubmit={handleBookLab}>
              <label>
                Diagnostic Test Package *
                <select value={newLabTest} onChange={(e) => {
                  setNewLabTest(e.target.value);
                  if (e.target.value.includes("Lipid")) setNewLabCategory("Biochemistry");
                  else if (e.target.value.includes("Glucose") || e.target.value.includes("HbA1c")) setNewLabCategory("Diabetology");
                  else if (e.target.value.includes("Vitamin")) setNewLabCategory("Vitamins");
                  else if (e.target.value.includes("X-Ray")) setNewLabCategory("Radiology");
                  else setNewLabCategory("Hematology");
                }}>
                  <option value="Complete Blood Count (CBC) & Hemogram">Complete Blood Count (CBC) & Hemogram</option>
                  <option value="Comprehensive Lipid Profile">Comprehensive Lipid Profile (Cholesterol, HDL, LDL)</option>
                  <option value="HbA1c & Fasting Plasma Glucose (FPG)">HbA1c & Fasting Plasma Glucose (FPG)</option>
                  <option value="Thyroid Profile Total (T3, T4, TSH)">Thyroid Profile Total (T3, T4, TSH)</option>
                  <option value="Vitamin D3 (25-OH) & Vitamin B12">Vitamin D3 (25-OH) & Vitamin B12</option>
                  <option value="Digital Chest X-Ray (PA View)">Digital Chest X-Ray (PA View)</option>
                  <option value="Kidney Function Test (KFT / RFT)">Kidney Function Test (KFT / RFT)</option>
                  <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Preferred Lab Center
                  <select value={newLabCenter} onChange={(e) => setNewLabCenter(e.target.value)}>
                    <option value="Apollo Diagnostics Centre">Apollo Diagnostics Centre</option>
                    <option value="Dr. Lal PathLabs & Diagnostics">Dr. Lal PathLabs & Diagnostics</option>
                    <option value="Metropolis Healthcare">Metropolis Healthcare</option>
                    <option value="Max Healthcare Labs">Max Healthcare Labs</option>
                    <option value="SwasthyaOne Clinical Lab">SwasthyaOne Clinical Lab</option>
                  </select>
                </label>
                <label>
                  Preferred Date
                  <input
                    type="date"
                    value={newLabDate}
                    onChange={(e) => setNewLabDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Referring Doctor
                <select value={newLabDoctor} onChange={(e) => setNewLabDoctor(e.target.value)}>
                  {doctors.map((d) => (
                    <option key={d.name} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </label>

              <div style={{ margin: "14px 0", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,168,150,0.08)", padding: "12px 14px", borderRadius: "10px" }}>
                <input
                  type="checkbox"
                  id="homeVisitCheck"
                  checked={newLabHomeVisit}
                  onChange={(e) => setNewLabHomeVisit(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#00a896" }}
                />
                <label htmlFor="homeVisitCheck" style={{ margin: 0, cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                  🏠 Free Home Sample Collection (Safe & Hygienic)
                </label>
              </div>

              <div className="contact-form-actions">
                <button type="submit" className="start-btn">Confirm Test Booking</button>
                <button type="button" className="login-btn" onClick={() => setShowBookLabModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Lab Report Breakdown Modal */}
      {selectedLabReport && (
        <div className="modal-overlay" onClick={() => setSelectedLabReport(null)}>
          <div className="contact-modal" style={{ maxWidth: 650, width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header" style={{ background: "linear-gradient(135deg, #007f71, #00a896)", color: "white" }}>
              <div>
                <h3 style={{ color: "white", margin: 0 }}>Diagnostic Report Verification 🔬</h3>
                <p style={{ color: "rgba(255,255,255,0.9)", margin: "4px 0 0 0" }}>NABL Accredited • Digital QR Verified</p>
              </div>
              <button className="modal-close-btn" style={{ color: "white" }} onClick={() => setSelectedLabReport(null)}>✕</button>
            </div>
            
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "16px", gap: "10px" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "17px", color: "var(--accent)" }}>{selectedLabReport.testName}</h4>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Lab: <strong>{selectedLabReport.labName}</strong></div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Doctor: <strong>{selectedLabReport.doctor}</strong></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Date of Report</div>
                  <strong>{selectedLabReport.date}</strong>
                  <div style={{ marginTop: "4px" }}>
                    <span className={`lab-status-tag ${selectedLabReport.status.toLowerCase()}`}>
                      {selectedLabReport.status === "Normal" ? "✓ Certified Normal" : "⚠️ Attention Required"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "13px", lineHeight: "1.5", color: "#334155" }}>
                <strong>Clinical Impression:</strong> {selectedLabReport.summary}
              </div>

              <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                <table className="lab-metrics-table">
                  <thead>
                    <tr>
                      <th>Biological Investigation</th>
                      <th>Observed Value</th>
                      <th>Reference Interval</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLabReport.metrics.map((m, idx) => (
                      <tr key={idx}>
                        <td><strong>{m.name}</strong></td>
                        <td style={{ color: m.status === "normal" ? "#008f80" : "#d97706", fontWeight: "700" }}>{m.value}</td>
                        <td style={{ color: "#64748b" }}>{m.ref}</td>
                        <td>
                          <span className={`lab-metric-indicator ${m.status}`}>
                            {m.status === "normal" ? "Normal" : m.status === "low" ? "Low" : "Borderline"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  <span>🔒 Digitally signed by Pathologist-in-Charge</span>
                  <div>NABL Registration: <strong>NABL-MED-2026-9481</strong></div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      onAlert?.(`Printing report for ${selectedLabReport.testName}...`, "info");
                    }}
                  >
                    🖨️ Print
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleDownloadLab(selectedLabReport)}
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insurance & Medical Document Viewer Modal */}
      {viewingInsuranceDoc && (
        <div className="modal-overlay" onClick={() => setViewingInsuranceDoc(null)}>
          <div className="contact-modal" style={{ maxWidth: 660, width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div
              className="contact-modal-header"
              style={{
                background: viewingInsuranceDoc.isMedical
                  ? "linear-gradient(135deg, #0284c7, #0369a1)"
                  : "linear-gradient(135deg, #007f71, #00a896)",
                color: "white",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "white" }}>
                  {viewingInsuranceDoc.isMedical ? "Attached Medical Report / Scan 📁" : "Attached Document 📄"}
                </h3>
                <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>
                  {viewingInsuranceDoc.name || "Medical Document"}
                  {viewingInsuranceDoc.size ? ` • ${viewingInsuranceDoc.size}` : ""}
                </p>
              </div>
              <button className="modal-close-btn" style={{ color: "white" }} onClick={() => setViewingInsuranceDoc(null)}>✕</button>
            </div>

            {/* If appointment has multiple reports, allow switching between them */}
            {viewingInsuranceDoc.allReports && viewingInsuranceDoc.allReports.length > 1 && (
              <div style={{ display: "flex", gap: "8px", padding: "10px 16px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
                {viewingInsuranceDoc.allReports.map((rep, idx) => (
                  <button
                    key={rep.id || idx}
                    type="button"
                    onClick={() => setViewingInsuranceDoc({
                      ...viewingInsuranceDoc,
                      name: rep.name,
                      preview: rep.preview,
                      size: rep.size,
                    })}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: viewingInsuranceDoc.name === rep.name ? "2px solid #0284c7" : "1px solid #cbd5e1",
                      background: viewingInsuranceDoc.name === rep.name ? "#e0f2fe" : "white",
                      color: viewingInsuranceDoc.name === rep.name ? "#0369a1" : "#475569",
                      fontSize: "12px",
                      fontWeight: viewingInsuranceDoc.name === rep.name ? "700" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>📁</span> {rep.name}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc" }}>
              {viewingInsuranceDoc.preview ? (
                <img
                  src={viewingInsuranceDoc.preview}
                  alt={viewingInsuranceDoc.name || "Full View"}
                  style={{ maxWidth: "100%", maxHeight: "420px", borderRadius: "10px", objectFit: "contain", boxShadow: "0 4px 18px rgba(0,0,0,0.12)" }}
                />
              ) : (
                <div style={{ padding: "40px 20px" }}>
                  <span style={{ fontSize: "52px" }}>📄</span>
                  <p style={{ marginTop: "12px", fontWeight: "600", color: "#334155" }}>{viewingInsuranceDoc.name}</p>
                </div>
              )}
            </div>
            <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewingInsuranceDoc(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  downloadInsuranceDocument(viewingInsuranceDoc, patientName || "Aarav Sharma");
                  onAlert?.(`Downloaded ${viewingInsuranceDoc.name || "document"} to your device library!`, "success");
                }}
              >
                ⬇️ Download Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Health Profile Modal (Login-Card Style) */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div
            className="auth-card profile-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Patient Profile"
          >
            {!isSettingsOpen ? (
              <>
                <div className="auth-logo">✚ SwasthyaOne</div>
                <div className="profile-modal-topbar">
                  <div className="profile-badge-pill">PATIENT HEALTH PROFILE</div>
                  <h1 className="profile-name-caps">{(patientName || "DAKSH").toUpperCase()}</h1>
                  <p className="profile-subtitle">Personal Health Metrics & Live Records</p>
                </div>

                <div className="profile-details-form">
                  {/* Health Problem Section */}
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <span className="label-icon">🩺</span>
                      <strong>Current Health Problem</strong>
                    </label>
                    <input
                      type="text"
                      className="profile-input"
                      value={healthProblem}
                      onChange={(e) => {
                        setHealthProblem(e.target.value);
                        try {
                          localStorage.setItem("swasthyaHealthProblem", e.target.value);
                        } catch {
                          /* ignore */
                        }
                      }}
                      placeholder="e.g. Mild Hypertension, Asthma, General Checkup"
                    />
                    <div className="health-preset-pills">
                      {[
                        "Healthy / Routine",
                        "Hypertension",
                        "Diabetes",
                        "Allergies",
                        "Back Pain",
                        "Fever / Flu",
                      ].map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`preset-pill ${
                            healthProblem.toLowerCase().includes(p.toLowerCase().split("/")[0].trim())
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setHealthProblem(p);
                            try {
                              localStorage.setItem("swasthyaHealthProblem", p);
                            } catch {
                              /* ignore */
                            }
                            onAlert?.(`Health problem updated to: ${p}`, "success");
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BMI Section */}
                  <div className="profile-field-group">
                    <div className="profile-bmi-header">
                      <label className="profile-field-label" style={{ margin: 0 }}>
                        <span className="label-icon">⚖️</span>
                        <strong>Body Mass Index (BMI)</strong>
                      </label>
                      <span
                        className="bmi-category-badge"
                        style={{ backgroundColor: bmiCategory.bg, color: bmiCategory.color }}
                      >
                        {bmiCategory.label}
                      </span>
                    </div>

                    <div className="bmi-metric-display">
                      <div className="bmi-number-box">
                        <span className="bmi-value-text">{bmi}</span>
                        <small>kg/m²</small>
                      </div>
                      <div className="bmi-quick-inputs">
                        <div>
                          <label>Height (cm)</label>
                          <input
                            type="number"
                            min="50"
                            max="250"
                            value={heightCm}
                            onChange={(e) => {
                              const h = e.target.value;
                              setHeightCm(h);
                              const computed = computeBmi(h, weightKg);
                              setBmi(computed);
                              try {
                                localStorage.setItem("swasthyaHeight", h);
                                localStorage.setItem("swasthyaBMI", computed);
                              } catch {
                                /* ignore */
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label>Weight (kg)</label>
                          <input
                            type="number"
                            min="20"
                            max="300"
                            value={weightKg}
                            onChange={(e) => {
                              const w = e.target.value;
                              setWeightKg(w);
                              const computed = computeBmi(heightCm, w);
                              setBmi(computed);
                              try {
                                localStorage.setItem("swasthyaWeight", w);
                                localStorage.setItem("swasthyaBMI", computed);
                              } catch {
                                /* ignore */
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bmi-slider-wrap">
                      <label>Adjust BMI directly:</label>
                      <input
                        type="range"
                        min="15"
                        max="40"
                        step="0.1"
                        value={parseFloat(bmi) || 22.4}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value).toFixed(1);
                          setBmi(val);
                          try {
                            localStorage.setItem("swasthyaBMI", val);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="bmi-range-slider"
                      />
                      <div className="bmi-scale-labels">
                        <span>15.0 (Under)</span>
                        <span>18.5 (Normal)</span>
                        <span>25.0 (Over)</span>
                        <span>30.0+ (Obese)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Settings and Back Buttons */}
                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-btn-settings"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    type="button"
                    className="profile-btn-back"
                    onClick={() => {
                      setShowProfileModal(false);
                      onAlert?.("Health profile and BMI updated!", "success");
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </>
            ) : (
              /* Settings View */
              <>
                <div className="auth-logo">✚ SwasthyaOne</div>
                <div className="profile-modal-topbar">
                  <div className="profile-badge-pill">ACCOUNT SETTINGS</div>
                  <h1 className="profile-name-caps">{(patientName || "KARTIK").toUpperCase()} SETTINGS</h1>
                  <p className="profile-subtitle">Manage personal preferences and clinical records</p>
                </div>

                <form
                  className="profile-details-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsSettingsOpen(false);
                    onAlert?.("Settings updated successfully!", "success");
                  }}
                >
                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <span className="label-icon">👤</span>
                      <strong>Full Patient Name</strong>
                    </label>
                    <input
                      type="text"
                      className="profile-input"
                      value={patientName}
                      placeholder="e.g. Kartik Sharma"
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        onUpdateUserName?.(e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <span className="label-icon">📞</span>
                      <strong>Emergency Contact Number</strong>
                    </label>
                    <input
                      type="tel"
                      className="profile-input"
                      value={emergencyContact}
                      onChange={(e) => {
                        setEmergencyContact(e.target.value);
                        try {
                          localStorage.setItem("swasthyaEmergencyPhone", e.target.value);
                        } catch {
                          /* ignore */
                        }
                      }}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">
                      <span className="label-icon">🩸</span>
                      <strong>Blood Group</strong>
                    </label>
                    <select
                      className="profile-input profile-select"
                      value={bloodGroup}
                      onChange={(e) => {
                        setBloodGroup(e.target.value);
                        try {
                          localStorage.setItem("swasthyaBloodGroup", e.target.value);
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-modal-actions" style={{ marginTop: "10px" }}>
                    <button type="submit" className="profile-btn-save">
                      ✓ Save Settings
                    </button>
                    <button
                      type="button"
                      className="profile-btn-back"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const icon =
          toast.type === "success" ? "✓" :
          toast.type === "error" ? "✕" :
          toast.type === "warning" ? "⚠️" : "ℹ️";

        return (
          <div
            key={toast.id}
            className={`toast-card toast-${toast.type}`}
            role="alert"
          >
            <div className={`toast-icon-wrap toast-icon-${toast.type}`}>
              <span>{icon}</span>
            </div>
            <div className="toast-content">
              <div className="toast-message">
                {String(toast.message).split("\n").map((line, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "4px 0 0" }}>{line}</p>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function parseCurrentRoute() {
  if (typeof window === "undefined") {
    return { screen: "dashboard", tab: "overview", authMode: "login" };
  }
  let path = (window.location.pathname || "/").toLowerCase();
  const rawHash = (window.location.hash || "").replace(/^#\/?/, "").toLowerCase();

  const target = rawHash || (path === "/" ? "" : path.replace(/^\//, "").replace(/\/$/, ""));

  if (target === "home" || target === "dashboard" || target === "overview") {
    return { screen: "dashboard", tab: "overview", authMode: "login" };
  }
  if (target === "appointments") {
    return { screen: "dashboard", tab: "appointments", authMode: "login" };
  }
  if (target === "doctors") {
    return { screen: "dashboard", tab: "doctors", authMode: "login" };
  }
  if (target === "payments") {
    return { screen: "dashboard", tab: "payments", authMode: "login" };
  }
  if (target === "insurance") {
    return { screen: "dashboard", tab: "insurance", authMode: "login" };
  }
  if (target === "documents") {
    return { screen: "dashboard", tab: "documents", authMode: "login" };
  }
  if (target === "prescriptions" || target === "prescription" || target === "rx") {
    return { screen: "dashboard", tab: "prescriptions", authMode: "login" };
  }
  if (target === "lab-reports" || target === "lab" || target === "labreports" || target === "reports") {
    return { screen: "dashboard", tab: "lab-reports", authMode: "login" };
  }
  if (target === "login") {
    return { screen: "auth", tab: "overview", authMode: "login" };
  }
  if (target === "signup") {
    return { screen: "auth", tab: "overview", authMode: "signup" };
  }
  if (target === "developer" || target === "developers") {
    return { screen: "developer", tab: "overview", authMode: "login" };
  }
  if (target === "landing") {
    return { screen: "landing", tab: "overview", authMode: "login" };
  }

  return { screen: "landing", tab: "overview", authMode: "login" };
}

export default function App() {
  const initialRoute = useMemo(() => parseCurrentRoute(), []);
  const [screen, setScreen] = useState(initialRoute.screen);
  const [dashboardTab, setDashboardTab] = useState(initialRoute.tab);
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("swasthyaUserName") || "Aarav Sharma";
    } catch {
      return "Aarav Sharma";
    }
  });
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem("swasthyaCurrency") || "INR";
    } catch {
      return "INR";
    }
  });
  const [authMode, setAuthMode] = useState(initialRoute.authMode);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("swasthyaTheme") === "dark";
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState([]);

  const handleUpdateUserName = useCallback((newName) => {
    if (!newName || !newName.trim()) return;
    const clean = newName.trim();
    setUserName(clean);
    try {
      localStorage.setItem("swasthyaUserName", clean);
    } catch {
      /* ignore */
    }
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const navigate = useCallback((toRoute, tabName = "overview", replace = false) => {
    const cleanRoute = toRoute.startsWith("/") ? toRoute : `/${toRoute}`;
    let nextScreen = "dashboard";
    let nextTab = tabName || "overview";
    let nextAuth = "login";

    if (cleanRoute === "/landing") {
      nextScreen = "landing";
    } else if (cleanRoute === "/developer" || cleanRoute === "/developers") {
      nextScreen = "developer";
    } else if (cleanRoute === "/login") {
      nextScreen = "auth";
      nextAuth = "login";
    } else if (cleanRoute === "/signup") {
      nextScreen = "auth";
      nextAuth = "signup";
    } else if (cleanRoute === "/home" || cleanRoute === "/dashboard") {
      nextScreen = "dashboard";
      nextTab = "overview";
    } else if (cleanRoute === "/appointments") {
      nextScreen = "dashboard";
      nextTab = "appointments";
    } else if (cleanRoute === "/doctors") {
      nextScreen = "dashboard";
      nextTab = "doctors";
    } else if (cleanRoute === "/payments") {
      nextScreen = "dashboard";
      nextTab = "payments";
    } else if (cleanRoute === "/insurance") {
      nextScreen = "dashboard";
      nextTab = "insurance";
    } else if (cleanRoute === "/documents") {
      nextScreen = "dashboard";
      nextTab = "documents";
    } else if (cleanRoute === "/prescriptions" || cleanRoute === "/prescription") {
      nextScreen = "dashboard";
      nextTab = "prescriptions";
    } else if (cleanRoute === "/lab-reports" || cleanRoute === "/lab" || cleanRoute === "/labreports") {
      nextScreen = "dashboard";
      nextTab = "lab-reports";
    }

    setScreen((prev) => (prev !== nextScreen ? nextScreen : prev));
    setDashboardTab((prev) => (prev !== nextTab ? nextTab : prev));
    if (nextScreen === "auth") setAuthMode((prev) => (prev !== nextAuth ? nextAuth : prev));

    try {
      if (typeof window !== "undefined" && window.location.pathname !== cleanRoute) {
        if (replace) {
          window.history.replaceState({ screen: nextScreen, tab: nextTab, authMode: nextAuth }, "", cleanRoute);
        } else {
          window.history.pushState({ screen: nextScreen, tab: nextTab, authMode: nextAuth }, "", cleanRoute);
        }
      }
    } catch {
      /* ignore history issues */
    }

    window.scrollTo(0, 0);
  }, []);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentRoute();
      setScreen(parsed.screen);
      setDashboardTab(parsed.tab);
      setAuthMode(parsed.authMode);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  // Intercept window.alert so any browser alert automatically shows as an on-screen toast!
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const text = String(msg || "");
      let type = "info";
      const lower = text.toLowerCase();
      if (lower.includes("not match") || lower.includes("please select") || lower.includes("error")) {
        type = "error";
      } else if (
        lower.includes("success") ||
        lower.includes("confirmed") ||
        lower.includes("sent") ||
        lower.includes("recorded") ||
        lower.includes("submitted")
      ) {
        type = "success";
      } else if (lower.includes("warning") || lower.includes("no doctor")) {
        type = "warning";
      }
      showToast(text, type);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  useEffect(() => {
    try {
      localStorage.setItem("swasthyaCurrency", currency);
    } catch {
      /* ignore */
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem("swasthyaTheme", darkMode ? "dark" : "light");
    } catch {
      /* storage may be unavailable */
    }
  }, [darkMode]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiToken, setApiToken] = useState(() => {
    try { return sessionStorage.getItem("swasthyaApiToken") || ""; } catch { return ""; }
  });
  const authenticate = useCallback(async (email, password) => {
    const result = await apiRequest("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password })
    });
    setApiToken(result.token);
    try { sessionStorage.setItem("swasthyaApiToken", result.token); } catch {}
    return result;
  }, []);
  useEffect(() => { if (apiToken) setIsLoggedIn(true); }, [apiToken]);
  const [postAuthRedirect, setPostAuthRedirect] = useState(null);

  function showAuth(mode, redirectTarget = null) {
    setPostAuthRedirect(redirectTarget);
    navigate(mode === "signup" ? "/signup" : "/login", "overview");
  }

  function handleHomeClick() {
    if (isLoggedIn) {
      navigate("/home", "overview");
      return;
    }
    setPostAuthRedirect("home");
    showToast("Please log in or sign up first to access the dashboard.", "info");
    navigate("/login", "overview");
  }

  function handleSearchDoctorsFromLanding() {
    if (isLoggedIn) {
      navigate("/doctors", "doctors");
      return;
    }
    setPostAuthRedirect("doctors");
    showToast("Please log in or sign up first to access the Doctor Finding directory.", "info");
    navigate("/login", "overview");
  }

  function handleGetStarted() {
    if (isLoggedIn) {
      navigate("/home", "overview");
      return;
    }
    setPostAuthRedirect("home");
    showToast("Please log in or sign up first to get started with your dashboard.", "info");
    navigate("/login", "overview");
  }

  function openDashboard(tab = "overview") {
    if (isLoggedIn) {
      navigate(tab === "overview" ? "/home" : `/${tab}`, tab);
      return;
    }
    setPostAuthRedirect(tab === "overview" ? "home" : tab);
    showToast("Please log in or sign up first to access this section.", "info");
    navigate("/login", tab);
  }

  const isDarkModeActive = darkMode && screen !== "landing" && screen !== "developer";

  return (
    <div className={`swasthya-app ${isDarkModeActive ? "dark-mode" : ""}`}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {screen === "landing" && (
        <LandingPage
          onAuth={showAuth}
          onDashboard={openDashboard}
          currency={currency}
          onCurrencyChange={setCurrency}
          onAlert={showToast}
          onNavigate={navigate}
          onSearchDoctors={handleSearchDoctorsFromLanding}
          onGetStarted={handleGetStarted}
          onHomeClick={handleHomeClick}
        />
      )}
      {screen === "developer" && (
        <DeveloperPage
          onBack={() => navigate("/landing")}
          onNavigate={navigate}
          onAlert={showToast}
        />
      )}
      {screen === "auth" && (
        <AuthPage
          mode={authMode}
          currentName={userName}
          redirectNotice={
            postAuthRedirect === "doctors"
              ? "🩺 Please log in or sign up to find and book verified doctors."
              : postAuthRedirect === "home"
              ? "🔐 Please log in or sign up to access your healthcare dashboard."
              : postAuthRedirect
              ? "🔐 Please log in or sign up to access this section."
              : null
          }
          onSwitch={(mode) => navigate(mode === "signup" ? "/signup" : "/login")}
          onBack={() => {
            setPostAuthRedirect(null);
            navigate("/landing");
          }}
          onSuccess={(enteredName, token) => {
            setIsLoggedIn(true);
            if (token) setApiToken(token);
            if (enteredName) {
              handleUpdateUserName(enteredName);
            }
            if (postAuthRedirect === "doctors") {
              setPostAuthRedirect(null);
              showToast("Welcome! You can now search and book verified doctors.", "success");
              navigate("/doctors", "doctors");
            } else if (postAuthRedirect) {
              const target = postAuthRedirect;
              setPostAuthRedirect(null);
              navigate(target === "home" ? "/home" : `/${target}`, target === "home" ? "overview" : target);
            } else {
              navigate("/home", "overview");
            }
          }}
          onAlert={showToast}
          onAuthenticate={authenticate}
        />
      )}
      {screen === "dashboard" && (
        <Dashboard
          onBack={() => navigate("/landing")}
          darkMode={darkMode}
          toggleTheme={() => setDarkMode((old) => !old)}
          initialTab={dashboardTab}
          currency={currency}
          onCurrencyChange={setCurrency}
          onAlert={showToast}
          onNavigate={navigate}
          userName={userName}
          onUpdateUserName={handleUpdateUserName}
          apiToken={apiToken}
        />
      )}
    </div>
  );
}

