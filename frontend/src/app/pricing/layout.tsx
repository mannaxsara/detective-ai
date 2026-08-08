import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Compare DetectiveAI pricing plans — Free Investigator, Pro Detective, and Enterprise Firm tiers with transparent feature breakdowns.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
