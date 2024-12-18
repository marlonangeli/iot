import '@/app/globals.css'
import {Inter} from 'next/font/google'
import {Toaster} from "@/components/ui/toaster"
import React from "react";

const inter = Inter({subsets: ['latin']})

export const metadata = {
  title: 'IoT Management System',
  description: 'A comprehensive IoT and logistics management system',
}

export default function RootLayout({children}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
    <body className={inter.className}>
    {children}
    <Toaster/>
    </body>
    </html>
  )
}
