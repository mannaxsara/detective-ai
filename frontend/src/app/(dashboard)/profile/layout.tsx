import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Manage your DetectiveAI account profile, API keys, and workspace preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
