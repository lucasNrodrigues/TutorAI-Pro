import type { Metadata } from "next";
import { Inter } from "next/font/google"; // ou Plus_Jakarta_Sans
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="pt-BR">
      {/* O body precisa ser w-full e bg-slate-50 para preencher a tela */}
      <body className={`${inter.className} bg-slate-50 w-full min-h-screen text-slate-800 antialiased`}>
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}