import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MDcalc — Медицинские калькуляторы",
  description: "Профессиональные калькуляторы для анестезиологии, коррекции электролитов, педиатрических доз, анализа газов крови и инфузионной терапии.",
  keywords: ["медицинский калькулятор", "анестезиология", "электролиты", "педиатрия", "газы крови", "инфузия"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-full`}
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        <div className="flex flex-col min-h-full">
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}
