"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { composeReady, sendEmail } from "@/lib/email";
import { formatDue } from "@/lib/dates";

export async function markReady(formData) {
  const caseRef = String(formData.get("caseRef") || "");
  if (!caseRef) return;
  const db = await getDb();

  // Flip the status only if it isn't ready yet: a double click can't send two emails.
  const c = await db.collection("cases").findOneAndUpdate(
    { caseRef, status: { $ne: "ready" } },
    { $set: { status: "ready", readyAt: new Date() } },
    { returnDocument: "after" });
  if (!c) return;
  const clinic = await db.collection("clinics").findOne({ _id: c.clinicId });

  const { subject, body } = composeReady({
    clinicName: clinic.name, caseRef: c.caseRef,
    patientRef: c.patientRef, kind: c.kind, dueDate: formatDue(c.dueDate),
  });
  const note = { caseRef, kind: "ready", to: clinic.email, subject, body, mode: "test", status: "pending", createdAt: new Date() };
  try {
    const { insertedId } = await db.collection("notifications").insertOne(note); // unique (caseRef, kind)
    const r = await sendEmail(clinic.email, subject, body);
    await db.collection("notifications").updateOne({ _id: insertedId }, { $set: { mode: r.mode, status: r.status, error: r.error ?? null } });
  } catch (err) {
    if (err?.code !== 11000) throw err; // duplicate = already notified, nothing to do
  }
  revalidatePath("/");
  revalidatePath("/outbox");
}
