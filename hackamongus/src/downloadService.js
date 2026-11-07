import { jsPDF } from "jspdf";

/**
 * Universal browser file downloader
 * Directly triggers download into the user's Downloads library / folder.
 */
export function triggerFileDownload(filename, fileUrlOrBlob, mimeType = "application/octet-stream") {
  try {
    if (typeof fileUrlOrBlob === "string") {
      if (fileUrlOrBlob.startsWith("data:") || fileUrlOrBlob.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = fileUrlOrBlob;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      // If it's a relative path like /xray-sample.jpg or /swasthyaone-logo-icon.png
      fetch(fileUrlOrBlob)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        })
        .catch(() => {
          const a = document.createElement("a");
          a.href = fileUrlOrBlob;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      return;
    }

    const blob = fileUrlOrBlob instanceof Blob ? fileUrlOrBlob : new Blob([fileUrlOrBlob], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error("Download error:", err);
  }
}

/**
 * Generates and downloads an authentic, official e-Prescription PDF
 */
export function downloadPrescriptionPDF(rx, patientName = "Aarav Sharma") {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 595
  const pageHeight = doc.internal.pageSize.getHeight(); // 842

  // 1. Top Header Banner
  doc.setFillColor(0, 127, 113); // Brand Teal
  doc.rect(0, 0, pageWidth, 84, "F");

  // Hospital Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SWASTHYAONE HEALTHCARE CLINIC", 36, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Integrated Digital Hospital & Polyclinic Network • Govt Reg: MH-MED-2026-4401", 36, 62);
  doc.text("24x7 Emergency Helpline: 1800-SWASTHYA • www.swasthyaone.com", 36, 75);

  // 2. Doctor Information Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, 96, pageWidth - 72, 68, 6, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, 96, pageWidth - 72, 68, 6, 6, "D");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(rx.doctor || "Dr. Meera Kapoor", 50, 118);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Specialty: Cardiologist & Internal Medicine | Reg No: MCI-${Math.floor(Math.random() * 80000 + 10000)}`, 50, 134);
  doc.text(`Clinic: Green Valley Clinic, Bandra West, Mumbai • OPD Timing: 10:00 AM - 06:00 PM`, 50, 149);

  // 3. Patient Demographics Row
  doc.setFillColor(241, 245, 249);
  doc.rect(36, 174, pageWidth - 72, 54, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(36, 174, pageWidth - 72, 54, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Patient Name:", 48, 194);
  doc.setFont("helvetica", "normal");
  doc.text(patientName, 126, 194);

  doc.setFont("helvetica", "bold");
  doc.text("Age / Gender:", 310, 194);
  doc.setFont("helvetica", "normal");
  doc.text("28 Yrs / Male", 385, 194);

  doc.setFont("helvetica", "bold");
  doc.text("Prescription Date:", 48, 214);
  doc.setFont("helvetica", "normal");
  doc.text(rx.date || "20 Oct 2026", 146, 214);

  doc.setFont("helvetica", "bold");
  doc.text("Rx Token ID:", 310, 214);
  doc.setFont("helvetica", "normal");
  doc.text(rx.id || `RX-2026-${Math.floor(Math.random() * 9000 + 1000)}`, 385, 214);

  // 4. Rx Symbol & Diagnosis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(0, 127, 113);
  doc.text("Rx", 42, 260);

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Clinical Diagnosis: ${rx.category || "General Infection • Routine Therapeutics"}`, 84, 258);

  // 5. Prescribed Medications Table
  let y = 280;

  // Table Header
  doc.setFillColor(0, 127, 113);
  doc.rect(36, y, pageWidth - 72, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("#", 48, y + 17);
  doc.text("Medication & Dosage", 76, y + 17);
  doc.text("Schedule & Frequency", 280, y + 17);
  doc.text("Duration", 450, y + 17);
  doc.text("Refills", 515, y + 17);

  y += 26;

  // Medication Item Row
  doc.setFillColor(255, 255, 255);
  doc.rect(36, y, pageWidth - 72, 60, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(36, y, pageWidth - 72, 60, "D");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1", 48, y + 24);
  doc.text(`${rx.name} ${rx.dosage}`, 76, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Type: ${rx.type || "Oral Formulation"}`, 76, y + 42);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(rx.frequency || "Twice Daily (Morning & Night)", 280, y + 24);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Take with meals", 280, y + 42);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(rx.days ? `${rx.days} Days` : "14 Days", 450, y + 24);

  doc.text(`${rx.refillsLeft ?? 2} Left`, 515, y + 24);

  y += 75;

  // 6. Clinical Instructions Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, y, pageWidth - 72, 70, 6, 6, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(36, y, pageWidth - 72, 70, 6, 6, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 127, 113);
  doc.text("Clinical Instructions & Patient Advice:", 50, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(rx.instructions || "• Take medication as prescribed after meals with a glass of water.", 50, y + 40);
  doc.text("• Complete the full antimicrobial / therapeutic cycle as directed.", 50, y + 54);

  y += 90;

  // 7. Preferred Pharmacy Partner
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(36, y, pageWidth - 72, 42, 6, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, y, pageWidth - 72, 42, 6, 6, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Dispensing Pharmacy:", 50, y + 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(rx.pharmacy || "Apollo Pharmacy, Bandra West (Doorstep Delivery Enabled)", 175, y + 26);

  // 8. Sign-off & Digital Signature Verification Box
  const signY = pageHeight - 165;
  doc.setDrawColor(203, 213, 225);
  doc.line(36, signY, pageWidth - 36, signY);

  // Left stamp
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(36, signY + 12, 170, 56, 4, 4, "F");
  doc.setDrawColor(20, 184, 166);
  doc.roundedRect(36, signY + 12, 170, 56, 4, 4, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text("✓ VERIFIED DIGITAL e-Rx", 46, signY + 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text("SwasthyaOne Certified Telehealth", 46, signY + 44);
  doc.text("Legal under Indian Telemedicine 2020", 46, signY + 56);

  // Right doctor signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(rx.doctor || "Dr. Meera Kapoor", pageWidth - 200, signY + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Digitally Signed Medical Practitioner", pageWidth - 200, signY + 46);
  doc.text("MCI Registration Active", pageWidth - 200, signY + 58);

  // 9. Bottom Security Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 34, pageWidth, 34, "F");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "SwasthyaOne Secure Health System • Valid across all authorized medical dispensaries in India • Confidential Clinical Record",
    pageWidth / 2,
    pageHeight - 14,
    { align: "center" }
  );

  const cleanMedName = (rx.name || "Medication").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `SwasthyaOne_eRx_${cleanMedName}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads an authentic, official NABL Diagnostic Lab Report PDF
 */
export function downloadDiagnosticLabPDF(lab, patientName = "Aarav Sharma") {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Navy Blue / Slate
  doc.rect(0, 0, pageWidth, 90, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SWASTHYAONE DIAGNOSTICS & PATHOLOGY", 36, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text("NABL ACCREDITED CLINICAL TESTING LABORATORY • ISO 15189:2022 CERTIFIED", 36, 62);
  doc.text("Registration No: NABL-MED-2026-9481 • Centre: Apollo Diagnostics Center, Bandra", 36, 76);

  // 2. Patient & Sample Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(36, 102, pageWidth - 72, 70, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(36, 102, pageWidth - 72, 70, "D");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Patient Name:", 48, 122);
  doc.setFont("helvetica", "normal");
  doc.text(patientName, 128, 122);

  doc.setFont("helvetica", "bold");
  doc.text("Age / Gender:", 310, 122);
  doc.setFont("helvetica", "normal");
  doc.text("28 Yrs / Male", 385, 122);

  doc.setFont("helvetica", "bold");
  doc.text("Referring Doctor:", 48, 142);
  doc.setFont("helvetica", "normal");
  doc.text(lab.doctor || "Dr. Meera Kapoor", 145, 142);

  doc.setFont("helvetica", "bold");
  doc.text("Sample Date:", 310, 142);
  doc.setFont("helvetica", "normal");
  doc.text(lab.date || "14 Oct 2026", 385, 142);

  doc.setFont("helvetica", "bold");
  doc.text("Specimen Type:", 48, 160);
  doc.setFont("helvetica", "normal");
  doc.text("Whole Blood EDTA / Serum", 136, 160);

  doc.setFont("helvetica", "bold");
  doc.text("Report Status:", 310, 160);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("FINAL VERIFIED", 385, 160);

  // 3. Test Title Banner
  doc.setFillColor(0, 127, 113);
  doc.rect(36, 184, pageWidth - 72, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(lab.testName || "Complete Blood Count (CBC)", 48, 203);

  // 4. Bio-Marker Parameters Table
  let y = 224;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(36, y, pageWidth - 72, 22, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(36, y, pageWidth - 72, 22, "D");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("TEST INVESTIGATION", 48, y + 15);
  doc.text("OBSERVED VALUE", 220, y + 15);
  doc.text("BIOLOGICAL REFERENCE", 340, y + 15);
  doc.text("UNIT", 460, y + 15);
  doc.text("FLAG", 515, y + 15);

  y += 22;

  // Realistic parameters based on the test
  let params = [
    { name: "Hemoglobin (Hb)", val: "14.8", ref: "13.0 - 17.0", unit: "g/dL", flag: "NORMAL" },
    { name: "Total RBC Count", val: "4.92", ref: "4.50 - 5.50", unit: "mill/cumm", flag: "NORMAL" },
    { name: "Total Leukocyte (WBC)", val: "7,400", ref: "4,000 - 11,000", unit: "/cumm", flag: "NORMAL" },
    { name: "Platelet Count", val: "275,000", ref: "150,000 - 450,000", unit: "/cumm", flag: "NORMAL" },
    { name: "Packed Cell Volume (PCV)", val: "43.2", ref: "40.0 - 50.0", unit: "%", flag: "NORMAL" },
    { name: "Mean Corpuscular Vol (MCV)", val: "87.8", ref: "80.0 - 100.0", unit: "fL", flag: "NORMAL" },
    { name: "MCH", val: "30.1", ref: "27.0 - 32.0", unit: "pg", flag: "NORMAL" },
    { name: "MCHC", val: "34.2", ref: "32.0 - 36.0", unit: "g/dL", flag: "NORMAL" },
    { name: "Neutrophils", val: "62", ref: "40 - 75", unit: "%", flag: "NORMAL" },
    { name: "Lymphocytes", val: "30", ref: "20 - 45", unit: "%", flag: "NORMAL" },
    { name: "Eosinophils", val: "4", ref: "1 - 6", unit: "%", flag: "NORMAL" },
    { name: "Monocytes", val: "4", ref: "2 - 10", unit: "%", flag: "NORMAL" },
  ];

  if ((lab.testName || "").toLowerCase().includes("lipid")) {
    params = [
      { name: "Total Cholesterol", val: "178", ref: "< 200", unit: "mg/dL", flag: "DESIRABLE" },
      { name: "HDL Cholesterol", val: "52", ref: "> 40", unit: "mg/dL", flag: "OPTIMAL" },
      { name: "LDL Cholesterol", val: "98", ref: "< 100", unit: "mg/dL", flag: "OPTIMAL" },
      { name: "Triglycerides", val: "135", ref: "< 150", unit: "mg/dL", flag: "NORMAL" },
      { name: "VLDL Cholesterol", val: "27", ref: "< 30", unit: "mg/dL", flag: "NORMAL" },
      { name: "Total / HDL Ratio", val: "3.42", ref: "< 4.5", unit: "Ratio", flag: "NORMAL" },
    ];
  } else if ((lab.testName || "").toLowerCase().includes("glucose") || (lab.testName || "").toLowerCase().includes("sugar") || (lab.testName || "").toLowerCase().includes("hba1c")) {
    params = [
      { name: "Fasting Blood Sugar (FBS)", val: "94", ref: "70 - 99", unit: "mg/dL", flag: "NORMAL" },
      { name: "Post Prandial (PPBS)", val: "128", ref: "< 140", unit: "mg/dL", flag: "NORMAL" },
      { name: "HbA1c (Glycated Hemoglobin)", val: "5.4", ref: "< 5.7", unit: "%", flag: "NORMAL" },
      { name: "Estimated Avg Glucose (eAG)", val: "108", ref: "80 - 120", unit: "mg/dL", flag: "NORMAL" },
    ];
  } else if ((lab.testName || "").toLowerCase().includes("thyroid") || (lab.testName || "").toLowerCase().includes("tsh")) {
    params = [
      { name: "Total Triiodothyronine (T3)", val: "1.24", ref: "0.80 - 2.00", unit: "ng/mL", flag: "NORMAL" },
      { name: "Total Thyroxine (T4)", val: "7.8", ref: "5.1 - 14.1", unit: "ug/dL", flag: "NORMAL" },
      { name: "TSH - Ultrasensitive", val: "2.14", ref: "0.35 - 4.94", unit: "uIU/mL", flag: "EUTHYROID" },
    ];
  } else if ((lab.testName || "").toLowerCase().includes("liver") || (lab.testName || "").toLowerCase().includes("lft")) {
    params = [
      { name: "Bilirubin Total", val: "0.8", ref: "0.2 - 1.2", unit: "mg/dL", flag: "NORMAL" },
      { name: "SGOT (AST)", val: "24", ref: "< 40", unit: "U/L", flag: "NORMAL" },
      { name: "SGPT (ALT)", val: "28", ref: "< 45", unit: "U/L", flag: "NORMAL" },
      { name: "Alkaline Phosphatase (ALP)", val: "78", ref: "30 - 120", unit: "U/L", flag: "NORMAL" },
      { name: "Total Protein", val: "7.4", ref: "6.0 - 8.3", unit: "g/dL", flag: "NORMAL" },
      { name: "Serum Albumin", val: "4.5", ref: "3.5 - 5.0", unit: "g/dL", flag: "NORMAL" },
    ];
  }

  params.forEach((p, idx) => {
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(36, y, pageWidth - 72, 22, "F");
    doc.setDrawColor(241, 245, 249);
    doc.rect(36, y, pageWidth - 72, 22, "D");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(p.name, 48, y + 15);

    doc.setFont("helvetica", "bold");
    doc.text(p.val, 220, y + 15);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(p.ref, 340, y + 15);
    doc.text(p.unit, 460, y + 15);

    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text(p.flag, 515, y + 15);

    y += 22;
  });

  y += 18;

  // 5. Clinical Pathologist Remarks Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, y, pageWidth - 72, 54, 4, 4, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(36, y, pageWidth - 72, 54, 4, 4, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Consultant Pathologist Observations:", 48, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("• All analyzed parameters are within biological reference limits. Clinical correlation recommended.", 48, y + 36);

  // 6. Signature Area
  const signY = pageHeight - 140;
  doc.setDrawColor(203, 213, 225);
  doc.line(36, signY, pageWidth - 36, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Dr. S. K. Mukherjee, MD", 48, signY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Consultant Pathologist", 48, signY + 42);
  doc.text("Reg No: MMC-1998-0442", 48, signY + 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Quality Control Director", pageWidth - 190, signY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SwasthyaOne Central Reference Lab", pageWidth - 190, signY + 42);
  doc.text("Electronically Signed & Authenticated", pageWidth - 190, signY + 54);

  // 7. Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 30, pageWidth, 30, "F");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "*** END OF SWASTHYAONE MEDICAL LAB REPORT • CONFIDENTIAL • ACCREDITED QUALITY STANDARDS ***",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  const cleanTest = (lab.testName || "Lab_Report").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `SwasthyaOne_LabReport_${cleanTest}.pdf`;
  doc.save(filename);
}

/**
 * Downloads a comprehensive medication chart & prescription summary PDF
 */
export function downloadAllPrescriptionsSummaryPDF(prescriptions = [], patientName = "Aarav Sharma") {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(0, 127, 113);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SWASTHYAONE - PATIENT MEDICATION SUMMARY", 36, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Comprehensive Active Rx Regimen for ${patientName} • Generated: 20 Oct 2026`, 36, 62);

  let y = 105;

  prescriptions.forEach((rx, idx) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(36, y, pageWidth - 72, 70, 6, 6, "F");
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(36, y, pageWidth - 72, 70, 6, 6, "D");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${idx + 1}. ${rx.name} - ${rx.dosage} (${rx.type})`, 50, y + 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Schedule: ${rx.frequency || "Daily"} • Duration: ${rx.days || 14} Days • Prescribed by: ${rx.doctor}`, 50, y + 42);
    doc.text(`Pharmacy: ${rx.pharmacy || "Apollo Pharmacy"} • Refills Left: ${rx.refillsLeft ?? 2}`, 50, y + 56);

    y += 82;
  });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Please consult your SwasthyaOne physician before stopping or altering dosage.", pageWidth / 2, pageHeight - 20, { align: "center" });

  doc.save(`SwasthyaOne_Prescription_Summary_${patientName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Downloads a cumulative diagnostic lab report summary PDF
 */
export function downloadAllLabsSummaryPDF(labReports = [], patientName = "Aarav Sharma") {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SWASTHYAONE CUMULATIVE DIAGNOSTIC REPORT", 36, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Official NABL Pathology & Diagnostic Summary for ${patientName} • 2026`, 36, 62);

  let y = 105;

  labReports.forEach((lab, idx) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(36, y, pageWidth - 72, 60, 6, 6, "F");
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(36, y, pageWidth - 72, 60, 6, 6, "D");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${idx + 1}. ${lab.testName}`, 50, y + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Laboratory: ${lab.labName || "Apollo Diagnostics"} • Sample Date: ${lab.date || "14 Oct 2026"} • Ref Doctor: ${lab.doctor}`, 50, y + 38);
    
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text(`Status: ${lab.status || "Normal - Within Physiological Limits"}`, 50, y + 51);

    y += 72;
  });

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("End of Cumulative Diagnostics • SwasthyaOne Electronic Health Record", pageWidth / 2, pageHeight - 20, { align: "center" });

  doc.save(`SwasthyaOne_Cumulative_Lab_Reports_${patientName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Downloads a digital chest X-ray radiography file (JPG) directly to disk
 */
export function downloadRadiologyXRay(patientName = "Aarav Sharma") {
  const filename = `SwasthyaOne_Radiology_Chest_XRay_PA_${patientName.replace(/\s+/g, '_')}.jpg`;
  triggerFileDownload(filename, "/chest-xray-scan.jpg", "image/jpeg");
}

/**
 * Downloads patient report or scan (either image or official PDF)
 */
export function downloadReportOrScan(report, patientName = "Aarav Sharma") {
  if (!report) return;

  const isXrayOrScan =
    (report.name || "").toLowerCase().includes("xray") ||
    (report.name || "").toLowerCase().includes("x-ray") ||
    (report.name || "").toLowerCase().includes("radiology") ||
    (report.name || "").toLowerCase().includes("scan") ||
    (report.type || "").toLowerCase().includes("radiology") ||
    (report.type || "").toLowerCase().includes("scan");

  if (isXrayOrScan) {
    if (report.preview && report.preview.startsWith("data:image")) {
      triggerFileDownload(report.name || "Chest_XRay_Scan.jpg", report.preview);
    } else {
      downloadRadiologyXRay(patientName);
    }
    return;
  }

  // If user uploaded an image
  if (report.preview && report.preview.startsWith("data:image")) {
    triggerFileDownload(report.name || "Patient_Medical_Report.jpg", report.preview);
    return;
  }

  // If it's a lab/pathology report
  downloadDiagnosticLabPDF(
    {
      testName: report.name ? report.name.replace(/\.[^/.]+$/, "") : "Clinical Diagnostic Report",
      date: report.date || "Today",
      doctor: report.doctor || "Dr. Meera Kapoor",
    },
    patientName
  );
}

/**
 * Downloads a medical record from the recent records table
 */
export function downloadMedicalRecord(record, patientName = "Aarav Sharma") {
  if (!record) return;

  const lowerType = (record.type || "").toLowerCase();
  if (lowerType.includes("radiology") || lowerType.includes("scan") || lowerType.includes("xray") || lowerType.includes("x-ray")) {
    downloadRadiologyXRay(patientName);
    return;
  }

  if (lowerType.includes("blood") || lowerType.includes("lab") || lowerType.includes("hemogram") || lowerType.includes("lipid")) {
    downloadDiagnosticLabPDF(
      {
        testName: record.desc || "Complete Blood Count (CBC)",
        date: record.date || "18 Oct 2026",
        doctor: record.doc || "Dr. Priya Sharma",
      },
      patientName
    );
    return;
  }

  if (lowerType.includes("prescription") || lowerType.includes("rx") || lowerType.includes("medicine")) {
    downloadPrescriptionPDF(
      {
        name: "Amoxicillin",
        dosage: "500 mg",
        type: "Capsule",
        frequency: "Twice daily (After meals)",
        days: 14,
        doctor: record.doc || "Dr. Rahul Mehta",
        category: record.desc || "Therapeutic Medication",
        date: record.date || "12 Oct 2026",
      },
      patientName
    );
    return;
  }

  // Fallback official medical certificate / record PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(0, 127, 113);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SWASTHYAONE OFFICIAL MEDICAL RECORD", 36, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Clinical Health Documentation & Patient Summary", 36, 62);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, 100, pageWidth - 72, 100, 6, 6, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(36, 100, pageWidth - 72, 100, 6, 6, "D");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Record: ${record.type || "Clinical Document"}`, 50, 128);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Patient: ${patientName} • Date: ${record.date || "October 2026"}`, 50, 148);
  doc.text(`Physician: ${record.doc || "Consultant"} • Description: ${record.desc || "Verified Clinical File"}`, 50, 168);

  doc.save(`SwasthyaOne_Record_${(record.type || "Medical").replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * Downloads an insurance card or submitted claim policy paper
 */
export function downloadInsuranceDocument(doc, patientName = "Aarav Sharma") {
  if (!doc) return;
  if (doc.preview && doc.preview.startsWith("data:image")) {
    triggerFileDownload(doc.name || "Insurance_Card.jpg", doc.preview);
    return;
  }
  if (doc.preview && (doc.preview.startsWith("/") || doc.preview.startsWith("http"))) {
    triggerFileDownload(doc.name || "Insurance_Document.png", doc.preview);
    return;
  }

  // Generate official health insurance card certificate PDF
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [420, 260] });
  pdf.setFillColor(0, 127, 113);
  pdf.rect(0, 0, 420, 50, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("SWASTHYAONE HEALTH INSURANCE CARD", 20, 30);

  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 50, 420, 210, "F");

  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(11);
  pdf.text(`Policy Holder: ${patientName}`, 24, 85);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Policy No: SW-IND-2026-881944`, 24, 105);
  pdf.text(`Sum Insured: ₹10,00,000 Cashless Hospitalization`, 24, 125);
  pdf.text(`TPA Desk: Star Health & SwasthyaOne Network`, 24, 145);
  pdf.text(`Emergency Helpline: 1800-SWASTHYA (24x7)`, 24, 165);

  pdf.setDrawColor(0, 127, 113);
  pdf.roundedRect(280, 75, 115, 95, 4, 4, "D");
  pdf.setFontSize(8);
  pdf.setTextColor(0, 127, 113);
  pdf.text("CASHLESS VERIFIED", 290, 115);
  pdf.text("Valid Till: 2027", 305, 130);

  pdf.save(`SwasthyaOne_Insurance_Card_${patientName.replace(/\s+/g, '_')}.pdf`);
}
