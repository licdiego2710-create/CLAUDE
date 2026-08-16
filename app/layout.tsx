import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juzgado Mercantil OS",
  description: "Generador privado de autos mercantiles"
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
