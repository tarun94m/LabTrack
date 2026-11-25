export function composeReady(e) {
  return {
    subject: `Case ${e.caseRef} is ready`,
    body: `Hello ${e.clinicName},\n\nYour ${e.kind.toLowerCase()} for patient ${e.patientRef} (case ${e.caseRef}) is ready.\nOriginal due date: ${e.dueDate}.\n\nReply to this email if you have any questions.\n`,
  };
}

/** Test mode (default) records the email without sending it. Live mode needs RESEND_API_KEY. */
export async function sendEmail(to, subject, body) {
  const live = process.env.EMAIL_MODE === "live" && !!process.env.RESEND_API_KEY;
  if (!live) return { mode: "test", status: "recorded" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text: body }),
    });
    if (!res.ok) return { mode: "live", status: "failed", error: `Resend ${res.status}: ${await res.text()}` };
    return { mode: "live", status: "sent" };
  } catch (err) {
    return { mode: "live", status: "failed", error: String(err) };
  }
}
