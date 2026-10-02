import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERPORT - Sistema Tarifario",
  description: "Prototipo funcional del Sistema Tarifario"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
