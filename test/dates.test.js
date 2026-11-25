import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDue, todayIn, daysBetween, addDays } from "../lib/dates.js";

test("due date prints the same calendar day regardless of TZ", () => {
  assert.equal(formatDue("2026-12-01"), "1 Dec 2026");
  assert.equal(formatDue("2026-01-01"), "1 Jan 2026");
  assert.equal(formatDue("2028-02-29"), "29 Feb 2028");
});

test("regression: the naive approach is wrong in some zones (why this fix exists)", () => {
  const naive = new Date("2026-12-01T00:00:00").toISOString().slice(0, 10); // local midnight -> UTC
  if ((process.env.TZ ?? "UTC") === "Pacific/Kiritimati") assert.notEqual(naive, "2026-12-01");
  assert.equal(formatDue("2026-12-01"), "1 Dec 2026");
});

test("rejects non-date input instead of guessing", () => {
  assert.throws(() => formatDue("2026-12-01T00:00:00Z"));
});

test("today in the lab zone and day arithmetic", () => {
  const t = new Date("2026-11-25T23:30:00Z");
  assert.equal(todayIn("Europe/London", t), "2026-11-25");
  assert.equal(todayIn("Australia/Sydney", t), "2026-11-26");
  assert.equal(daysBetween("2026-11-25", "2026-11-28"), 3);
  assert.equal(daysBetween("2026-03-28", "2026-03-30"), 2);
  assert.equal(addDays("2026-02-27", 2), "2026-03-01");
});
