'use client'

import {useEffect, useState} from 'react'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {BatteryLow, Bell, Thermometer, WifiOff} from 'lucide-react'
import {useToast} from "@/hooks/use-toast";

// Simulated alert data
function generateAlert(): Alert {
  return {
    id: Math.random().toString(36).substring(2, 9),
    type: ['battery', 'temperature', 'connection'][Math.floor(Math.random() * 3)],
    deviceId: `Device-${Math.floor(Math.random() * 100)}`,
    message: `Alert message ${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  } as Alert
}

interface Alert {
  id: string
  type: 'battery' | 'temperature' | 'connection'
  deviceId: string
  message: string
  timestamp: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([] as Alert[])
  const {toast} = useToast()

  useEffect(() => {
    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new alert
        setAlerts(prevAlerts => {
          return [generateAlert(), ...prevAlerts.slice(0, 99)];
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = ({type}: { type: "battery" | "temperature" | "connection" }) => {
    switch (type) {
      case "battery":
        return <BatteryLow className="h-4 w-4"/>
      case "temperature":
        return <Thermometer className="h-4 w-4"/>
      case "connection":
        return <WifiOff className="h-4 w-4"/>
      default:
        return <Bell className="h-4 w-4"/>
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alerts and Monitoring</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getAlertIcon({type: alert.type})}
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
              </CardTitle>
              <CardDescription>{alert.deviceId}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{alert.message}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant="outline">{new Date(alert.timestamp).toLocaleString()}</Badge>
              <Button size="sm" onClick={() => {
                setAlerts(prevAlerts => {
                  const index = prevAlerts.findIndex(a => a.id === alert.id)
                  if (index !== -1) {
                    const updatedAlerts = [...prevAlerts]
                    updatedAlerts.splice(index, 1)
                    return updatedAlerts
                  }
                  return prevAlerts
                })
                toast({
                  title: 'Alert acknowledged',
                  description: `Alert from ${alert.deviceId} has been acknowledged.`,
                })
              }}>Acknowledge</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No active alerts at the moment.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

