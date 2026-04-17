import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ranking Comercial | Antunes",
  description: "Dashboard de ranking comercial integrado ao Kommo CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0a0a0f] font-[family-name:var(--font-montserrat)] text-white">
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
