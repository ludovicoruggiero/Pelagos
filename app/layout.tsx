import type React from "react"
import type { Metadata } from "next"
import { Maven_Pro } from "next/font/google"
import "../styles/globals.css"

import { APP_CONFIG } from "@/lib/constants"

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-maven-pro",
})

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={mavenPro.variable}>
      <body className={mavenPro.className}>{children}</body>
    </html>
  )
}
