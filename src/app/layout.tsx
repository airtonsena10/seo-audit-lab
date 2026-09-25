import type { Metadata } from "next"
import { Instrument_Serif, JetBrains_Mono, Sora } from "next/font/google"
import "./globals.css"

const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
})

const body = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600"],
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "SEO Audit Lab",
  description:
    "Dashboard de desafio prático para auditoria SEO técnica em blogs WordPress, com insights gerados por IA.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
