// Runs the date tests under several time-zone settings (works on Windows, macOS and Linux).
import { spawnSync } from "node:child_process";
for (const TZ of ["UTC", "America/Los_Angeles", "Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
  console.log(`\n--- TZ=${TZ}`);
  const r = spawnSync(process.execPath, ["--test", "test/dates.test.js"], { env: { ...process.env, TZ }, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
