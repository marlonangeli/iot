'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Activity, Battery, Thermometer, Truck } from 'lucide-react'

const dadosDispositivos = [
  { nome: 'Sensores', valor: 400 },
  { nome: 'Rastreadores', valor: 300 },
  { nome: 'Ambiental', valor: 200 },
  { nome: 'Outros', valor: 100 },
]

const dadosTemperatura = [
  { nome: '00:00', valor: 20 },
  { nome: '04:00', valor: 22 },
  { nome: '08:00', valor: 25 },
  { nome: '12:00', valor: 28 },
  { nome: '16:00', valor: 26 },
  { nome: '20:00', valor: 23 },
]

const niveisBateria = [
  { nome: 'Cheio', valor: 300 },
  { nome: 'Alto', valor: 200 },
  { nome: 'Médio', valor: 100 },
  { nome: 'Baixo', valor: 50 },
]

const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function PaginaPainel() {
  const [dispositivosAtivos, setDispositivosAtivos] = useState(0)
  const [alertasTotais, setAlertasTotais] = useState(0)

  useEffect(() => {
    // Simula atualizações em tempo real
    const intervalo = setInterval(() => {
      setDispositivosAtivos(Math.floor(Math.random() * 500) + 500)
      setAlertasTotais(Math.floor(Math.random() * 20))
    }, 5000)

    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Painel</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispositivosAtivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Totais</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertasTotais}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Bateria</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Média entre todos os dispositivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transportes Ativos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendência de Temperatura</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosTemperatura}>
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tipos de Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosDispositivos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosDispositivos.map((entrada, indice) => (
                    <Cell key={`cell-${indice}`} fill={CORES[indice % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Níveis de Bateria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={niveisBateria}>
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
