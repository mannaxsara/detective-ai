import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Archives",
  description:
    "Browse your complete investigation history — past dataset analyses, forensic reports, and archived case files.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
