'use client'

import {useEffect, useState} from 'react'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {BatteryLow, Bell, Thermometer, WifiOff} from 'lucide-react'
import {useToast} from "@/hooks/use-toast";

function gerarAlerta(): Alerta {
  return {
    id: Math.random().toString(36).substring(2, 9),
    tipo: ['bateria', 'temperatura', 'conexão'][Math.floor(Math.random() * 3)],
    dispositivoId: `Dispositivo-${Math.floor(Math.random() * 100)}`,
    mensagem: `Mensagem de alerta ${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  } as Alerta
}

interface Alerta {
  id: string
  tipo: 'bateria' | 'temperatura' | 'conexão'
  dispositivoId: string
  mensagem: string
  timestamp: string
}

export default function PaginaDeAlertas() {
  const [alertas, setAlertas] = useState([] as Alerta[])
  const {toast} = useToast()

  useEffect(() => {
    // Simula alertas em tempo real
    const intervalo = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance de novo alerta
        setAlertas(alertasAnteriores => {
          return [gerarAlerta(), ...alertasAnteriores.slice(0, 99)];
        })
      }
    }, 3000)

    return () => clearInterval(intervalo)
  }, [])

  const obterIconeDeAlerta = ({tipo}: { tipo: "bateria" | "temperatura" | "conexão" }) => {
    switch (tipo) {
      case "bateria":
        return <BatteryLow className="h-4 w-4"/>
      case "temperatura":
        return <Thermometer className="h-4 w-4"/>
      case "conexão":
        return <WifiOff className="h-4 w-4"/>
      default:
        return <Bell className="h-4 w-4"/>
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alertas e Monitoramento</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alertas.map((alerta) => (
          <Card key={alerta.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {obterIconeDeAlerta({tipo: alerta.tipo})}
                {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)} Alerta
              </CardTitle>
              <CardDescription>{alerta.dispositivoId}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{alerta.mensagem}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant="outline">{new Date(alerta.timestamp).toLocaleString()}</Badge>
              <Button size="sm" onClick={() => {
                setAlertas(alertasAnteriores => {
                  const indice = alertasAnteriores.findIndex(a => a.id === alerta.id)
                  if (indice !== -1) {
                    const alertasAtualizados = [...alertasAnteriores]
                    alertasAtualizados.splice(indice, 1)
                    return alertasAtualizados
                  }
                  return alertasAnteriores
                })
                toast({
                  title: 'Alerta reconhecido',
                  description: `O alerta do ${alerta.dispositivoId} foi reconhecido.`,
                })
              }}>Reconhecer</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {alertas.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum alerta ativo no momento.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
