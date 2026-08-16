import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVLuminio | Cotizador",
  description: "Cotizador rápido de ventanas, puertas y canceles de aluminio"
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
