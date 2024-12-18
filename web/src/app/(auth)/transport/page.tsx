'use client'

import {useState} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'

const vehicles = [
  {
    id: 1,
    licensePlate: 'ABC123',
    type: 'truck',
    status: 'en route',
    origin: 'Warehouse A',
    destination: 'Store 1',
    cargo: 'Electronics'
  },
  {
    id: 2,
    licensePlate: 'DEF456',
    type: 'ship',
    status: 'loading',
    origin: 'Port B',
    destination: 'Port C',
    cargo: 'Furniture'
  },
  {
    id: 3,
    licensePlate: 'GHI789',
    type: 'train',
    status: 'unloading',
    origin: 'Station X',
    destination: 'Station Y',
    cargo: 'Raw Materials'
  },
  {
    id: 4,
    licensePlate: 'JKL012',
    type: 'airplane',
    status: 'maintenance',
    origin: 'Airport 1',
    destination: 'Airport 2',
    cargo: 'Perishables'
  },
]

const temperatureData = [
  {time: '00:00', temperature: 20},
  {time: '04:00', temperature: 22},
  {time: '08:00', temperature: 25},
  {time: '12:00', temperature: 28},
  {time: '16:00', temperature: 26},
  {time: '20:00', temperature: 23},
]

export default function TransportPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transport Management</h1>

      <div className="flex space-x-2">
        <Input
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter the details for the new vehicle.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="licensePlate" className="text-right">License Plate</Label>
                <Input id="licensePlate" className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="ship">Ship</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="airplane">Airplane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Cargo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.licensePlate}</TableCell>
              <TableCell>{vehicle.type}</TableCell>
              <TableCell>{vehicle.status}</TableCell>
              <TableCell>{vehicle.origin}</TableCell>
              <TableCell>{vehicle.destination}</TableCell>
              <TableCell>{vehicle.cargo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="text-xl font-semibold mt-8">Cargo Temperature (Last 24 hours)</h2>
      <div style={{width: '100%', height: 300}}>
        <ResponsiveContainer>
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="time"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Line type="monotone" dataKey="temperature" stroke="#8884d8"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
