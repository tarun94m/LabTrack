import { getDb } from "../lib/db.js";
import { addDays, todayIn } from "../lib/dates.js";

const db = await getDb();

// Indexes are what make "one case ref" and "one ready email per case" true.
await db.collection("cases").createIndex({ caseRef: 1 }, { unique: true });
await db.collection("notifications").createIndex({ caseRef: 1, kind: 1 }, { unique: true });

if ((await db.collection("clinics").countDocuments()) === 0) {
  await db.collection("clinics").insertMany([
    { _id: "harbour", name: "Harbour Dental, Sydney", email: "harbour@example.com", country: "Australia" },
    { _id: "kensington", name: "Kensington Smiles, London", email: "kensington@example.com", country: "United Kingdom" },
    { _id: "pacific", name: "Pacific Dental Group, Los Angeles", email: "pacific@example.com", country: "United States" },
    { _id: "southern", name: "Southern Cross Dental, Auckland", email: "southern@example.com", country: "New Zealand" },
  ]);
}
if ((await db.collection("cases").countDocuments()) === 0) {
  const today = todayIn(process.env.LAB_TIMEZONE || "Europe/London");
  // dueDate is a plain "YYYY-MM-DD" string, never a BSON Date.
  const c = (caseRef, clinicId, patientRef, kind, status, offset) =>
    ({ caseRef, clinicId, patientRef, kind, status, dueDate: addDays(today, offset), createdAt: new Date() });
  await db.collection("cases").insertMany([
    c("LT-1001", "harbour", "J.M.", "Zirconia crown", "in_progress", 1),
    c("LT-1002", "kensington", "A.K.", "3-unit bridge", "received", 3),
    c("LT-1003", "pacific", "R.S.", "Veneer set (6)", "in_progress", -2),
    c("LT-1004", "southern", "T.W.", "Implant crown", "received", 6),
    c("LT-1005", "pacific", "D.P.", "Night guard", "received", 9),
    c("LT-1006", "kensington", "C.L.", "E.max crown", "ready", 0),
    c("LT-1007", "harbour", "M.B.", "Partial denture", "in_progress", 2),
    c("LT-1008", "southern", "S.H.", "Inlay", "received", -1),
  ]);
}
console.log("Database ready.");
process.exit(0);
