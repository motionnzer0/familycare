import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Family Care Command Center",
  description: "Everything your family needs to coordinate care for an aging parent in one private place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-canvas text-content">
        {children}
      </body>
    </html>
  );
}
