import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pregate — Waitlist infrastructure for builders",
  description: "Launch your waitlist in 60 seconds. Collect leads, gate access, and notify your audience when you're ready.",
  openGraph: {
    title: "Pregate — Waitlist infrastructure for builders",
    description: "Launch your waitlist in 60 seconds.",
    url: "https://pregate.io",
    siteName: "Pregate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregate — Waitlist infrastructure for builders",
    description: "Launch your waitlist in 60 seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
