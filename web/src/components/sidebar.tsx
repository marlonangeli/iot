'use client'

import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Activity, Bell, Cpu, LayoutDashboard, LogOut, Map, Menu, Settings, Truck} from 'lucide-react'

const sidebarItems = [
  {name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard'},
  {name: 'Device Management', icon: Cpu, href: '/devices'},
  {name: 'Interactive Map', icon: Map, href: '/map'},
  {name: 'Transport Management', icon: Truck, href: '/transport'},
  {name: 'Event Streaming', icon: Activity, href: '/events'},
  {name: 'Alerts', icon: Bell, href: '/alerts'},
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4"/>
      </Button>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold">IoT Dashboard</h1>
          </div>
          <ScrollArea className="flex-1">
            <nav className="space-y-2 p-2">
              {sidebarItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button variant="ghost" className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4"/>
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4"/>
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
