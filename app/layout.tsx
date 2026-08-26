import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arena Robótica",
  description: "Cronômetro simultâneo e sorteador de bandeiras para desafios de robótica.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
