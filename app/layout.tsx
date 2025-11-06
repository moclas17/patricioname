import React from "react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POAPtricioname",
  description: "Agrega automáticamente saco naranja, camisa blanca y corbata negra a tus fotos al mas puro estilo de Patrcio de POAP"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
