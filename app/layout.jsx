import "./globals.css";
import Link from "next/link";
export const metadata = { title: "LabTrack", description: "Dental lab case tracking" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand">LabTrack</Link>
          <nav><Link href="/">Cases</Link><Link href="/outbox">Sent emails</Link></nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
