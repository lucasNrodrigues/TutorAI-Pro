import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TutorAI Pro",
  description: "Seu parceiro de estudos inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} w-full min-h-screen bg-slate-50 text-slate-800 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100`}
      >
        <ThemeProvider>
          <Toaster
            richColors
            position="top-right"
          />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}