import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Note",
  description: "Tus notas, clases y libros en un solo lugar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}