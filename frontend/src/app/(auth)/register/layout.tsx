import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free DetectiveAI account to start uploading datasets and running automated statistical forensics investigations.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
