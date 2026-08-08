import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Evidence Dataset",
  description:
    "Upload CSV, Excel, or Parquet evidence datasets for automated Polars columnar profiling and statistical forensics analysis.",
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
