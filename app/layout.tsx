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
