import Link from "next/link";
import { getDb } from "@/lib/db";
import { daysBetween, formatDue, todayIn } from "@/lib/dates";
import { markReady } from "./actions";

export const dynamic = "force-dynamic";

function dueLabel(due, today, status) {
  if (status === "ready") return { text: formatDue(due), note: "", tone: "" };
  const d = daysBetween(today, due);
  if (d < 0) return { text: formatDue(due), note: `${-d} day${d === -1 ? "" : "s"} late`, tone: "late" };
  if (d === 0) return { text: formatDue(due), note: "today", tone: "soon" };
  if (d <= 2) return { text: formatDue(due), note: `in ${d} day${d === 1 ? "" : "s"}`, tone: "soon" };
  return { text: formatDue(due), note: "", tone: "" };
}

export default async function Page({ searchParams }) {
  const { show = "open" } = await searchParams;
  const tab = ["ready", "all"].includes(show) ? show : "open";
  const tz = process.env.LAB_TIMEZONE || "Europe/London";
  const today = todayIn(tz);
  const db = await getDb();
  const clinics = Object.fromEntries((await db.collection("clinics").find().toArray()).map((c) => [c._id, c.name]));
  const rows = (await db.collection("cases").find().sort({ dueDate: 1, caseRef: 1 }).toArray())
    .map((c) => ({ ...c, clinic: clinics[c.clinicId] }));
  const open = rows.filter((r) => r.status !== "ready");
  const late = open.filter((r) => r.dueDate < today).length;
  const soon = open.filter((r) => r.dueDate >= today && daysBetween(today, r.dueDate) <= 2).length;
  const shown = tab === "ready" ? rows.filter((r) => r.status === "ready") : tab === "all" ? rows : open;

  return (
    <>
      <section className="summary" aria-label="Summary">
        <p className={late ? "late" : ""}><strong>{late}</strong> late</p>
        <p><strong>{soon}</strong> due within 2 days</p>
        <p><strong>{open.length}</strong> open in total</p>
      </section>
      <div className="tabs">
        {[["open", "Open"], ["ready", "Ready"], ["all", "All"]].map(([k, label]) => (
          <Link key={k} href={k === "open" ? "/" : `/?show=${k}`} className={tab === k ? "on" : ""}>{label}</Link>
        ))}
      </div>
      {shown.length === 0 ? <p className="empty">No cases here. Cases appear when a clinic sends one in.</p> : (
        <ul className="cases">
          {shown.map((r) => {
            const due = dueLabel(r.dueDate, today, r.status);
            return (
              <li key={r.caseRef} className={`case ${due.tone}`}>
                <div className="main"><strong>{r.caseRef}</strong> <span>{r.kind}</span><small>{r.clinic} · {r.patientRef}</small></div>
                <div className="due"><span>Due {due.text}</span>{due.note && <em>{due.note}</em>}</div>
                <div className="act">
                  {r.status === "ready" ? <span className="pill ok">Ready, clinic emailed</span> : (
                    <form action={markReady}><input type="hidden" name="caseRef" value={r.caseRef} /><button>Mark ready &amp; email clinic</button></form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
