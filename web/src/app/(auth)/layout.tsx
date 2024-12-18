'use client'

import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Notifications from '@/components/notifications'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export default function AuthLayout({children,}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus !== 'true') {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <Sidebar/>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-end">
              <Notifications/>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </QueryClientProvider>
    </div>
  )
}
