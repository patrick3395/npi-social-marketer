import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NPI Social Marketer",
  description:
    "Generate and post social media content for Noble Property Inspections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] min-h-screen text-white">{children}</body>
    </html>
  );
}
