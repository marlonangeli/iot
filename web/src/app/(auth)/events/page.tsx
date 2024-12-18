'use client'

import {useEffect, useState} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

// Simulated event data
function generateEvent(): Event {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
    deviceId: `Device-${Math.floor(Math.random() * 100)}`,
    message: `Event message ${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  } as Event
}

interface Event {
  id: string
  type: 'info' | 'warning' | 'error'
  deviceId: string
  message: string
  timestamp: string
}

export default function EventsPage() {
  const [events, setEvents] = useState([] as Event[])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    // Simulate real-time event streaming
    const interval = setInterval(() => {
      setEvents(prevEvents => [generateEvent(), ...prevEvents.slice(0, 99)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredEvents = events.filter(event =>
    (event.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.message.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === '' || event.type === filterType)
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Real-Time Event Streaming</h1>

      <div className="flex space-x-2">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Device ID</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.type}</TableCell>
              <TableCell>{event.deviceId}</TableCell>
              <TableCell>{event.message}</TableCell>
              <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
