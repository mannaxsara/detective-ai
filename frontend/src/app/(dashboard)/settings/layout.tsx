import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure your DetectiveAI workspace settings, notification preferences, and security options.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
