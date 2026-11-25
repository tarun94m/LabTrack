import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Outbox() {
  const db = await getDb();
  const rows = await db.collection("notifications").find().sort({ createdAt: -1 }).limit(50).toArray();
  return (
    <>
      <h1>Sent emails</h1>
      <p className="hint">In test mode emails are recorded here and not delivered. Set EMAIL_MODE=live to deliver them.</p>
      {rows.length === 0 ? <p className="empty">Nothing yet. Mark a case ready and the clinic email shows up here.</p> : rows.map((n) => (
        <details key={String(n._id)} className="mail">
          <summary><strong>{n.caseRef}</strong> to {n.to} <span className={`pill ${n.status === "failed" ? "bad" : "ok"}`}>{n.mode === "test" ? "test, not delivered" : n.status}</span></summary>
          <pre>{`Subject: ${n.subject}\n\n${n.body}`}{n.error ? `\nError: ${n.error}` : ""}</pre>
        </details>
      ))}
    </>
  );
}
