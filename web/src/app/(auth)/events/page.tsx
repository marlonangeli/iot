'use client'

import {useEffect, useState} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

// Dados simulados de eventos
function gerarEvento(): Evento {
  return {
    id: Math.random().toString(36).substr(2, 9),
    tipo: ['informação', 'aviso', 'erro'][Math.floor(Math.random() * 3)],
    dispositivoId: `Dispositivo-${Math.floor(Math.random() * 100)}`,
    mensagem: `Mensagem do evento ${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  } as Evento
}

interface Evento {
  id: string
  tipo: 'informação' | 'aviso' | 'erro'
  dispositivoId: string
  mensagem: string
  timestamp: string
}

export default function PaginaDeEventos() {
  const [eventos, setEventos] = useState([] as Evento[])
  const [termoDeBusca, setTermoDeBusca] = useState('')
  const [tipoDeFiltro, setTipoDeFiltro] = useState('')

  useEffect(() => {
    // Simula streaming de eventos em tempo real
    const intervalo = setInterval(() => {
      setEventos(eventosAnteriores => [gerarEvento(), ...eventosAnteriores.slice(0, 99)])
    }, 5000)

    return () => clearInterval(intervalo)
  }, [])

  const eventosFiltrados = eventos.filter(evento =>
    (evento.dispositivoId.toLowerCase().includes(termoDeBusca.toLowerCase()) ||
      evento.mensagem.toLowerCase().includes(termoDeBusca.toLowerCase())) &&
    (tipoDeFiltro === '' || evento.tipo === tipoDeFiltro)
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Streaming de Eventos em Tempo Real</h1>

      <div className="flex space-x-2">
        <Input
          placeholder="Pesquisar eventos..."
          value={termoDeBusca}
          onChange={(e) => setTermoDeBusca(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tipoDeFiltro} onValueChange={setTipoDeFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="informação">Informação</SelectItem>
            <SelectItem value="aviso">Aviso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>ID do Dispositivo</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Data/Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventosFiltrados.map((evento) => (
            <TableRow key={evento.id}>
              <TableCell>{evento.tipo}</TableCell>
              <TableCell>{evento.dispositivoId}</TableCell>
              <TableCell>{evento.mensagem}</TableCell>
              <TableCell>{new Date(evento.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
