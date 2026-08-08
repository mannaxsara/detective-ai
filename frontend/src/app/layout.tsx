import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "DetectiveAI — Autonomous Data Forensics & Statistical Intelligence Engine",
    template: "%s | DetectiveAI Forensics"
  },
  description: "Upload CSV, Excel, or Parquet datasets. DetectiveAI profiles schema health, isolates 3-sigma anomalies, projects ARIMA forecasts, and exports executive briefing reports in under 10 seconds.",
  keywords: ["Data Forensics", "Polars Engine", "Statistical Intelligence", "Anomaly Detection", "ARIMA Forecasting", "Automated EDA", "Executive PDF Briefings"],
  authors: [{ name: "DetectiveAI Core Team" }],
  metadataBase: new URL("https://projectdetective.vercel.app"),
  openGraph: {
    title: "DetectiveAI — Autonomous Data Forensics & Statistical Intelligence Engine",
    description: "Battle-tested Polars Rust forensics engine for instant dataset profiling, 3-sigma anomaly sweeps, and executive PDF briefing reports.",
    url: "https://projectdetective.vercel.app",
    siteName: "DetectiveAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DetectiveAI — Autonomous Data Forensics",
    description: "Battle-tested Polars Rust forensics engine for instant dataset profiling, 3-sigma anomaly sweeps, and executive PDF briefing reports.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-[#f9f9f7] min-h-screen antialiased transition-colors duration-200`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
