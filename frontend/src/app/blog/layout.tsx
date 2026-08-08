import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Technical Insights",
  description:
    "Technical articles, case studies, and product updates from the DetectiveAI data forensics engineering team.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
