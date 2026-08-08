import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forensics Workspace",
  description:
    "Your DetectiveAI forensics workspace — upload datasets, view analysis summaries, and access investigation history.",
};

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
