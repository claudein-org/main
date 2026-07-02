import "@/css/panda.css"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ClaudeIn",
  description: "Post to LinkedIn, Facebook, Instagram, YouTube, and DEV.to from Claude Code.",
  openGraph: {
    title: "ClaudeIn",
    description: "Post to LinkedIn, Facebook, Instagram, YouTube, and DEV.to from Claude Code.",
    images: [{ url: "/og.png" }],
  },
}

interface Props {
  children: React.ReactNode
}

export default function layout({ children }: Props) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
