import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fuente guardada en app/fonts (no depende de internet al compilar)
const inter = localFont({
  variable: "--font-inter",
  src: [{ path: "./fonts/Inter.woff2", weight: "100 900", style: "normal" }],
});

export const metadata: Metadata = {
  title: "La Bomboncita — Cevichería",
  description:
    "Ceviches, menú marino y platos a la carta. Carta, horario, ubicación y pedidos por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`light ${inter.variable} antialiased`} data-theme="light">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
