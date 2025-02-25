'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventData } from "@/components/event/event-form";

interface EventTableProps {
  events: EventData[];
}

export function EventTable({ events }: EventTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Descrição (Opcional)</TableHead>
          <TableHead>Metadados</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event, idx) => (
          <TableRow key={idx}>
            <TableCell>{event.type.name}</TableCell>
            <TableCell>{new Date(event.date).toLocaleString()}</TableCell>
            <TableCell>{event.type.description || '-'}</TableCell>
            {/* json formatted as monospaced font and pretty json format */}
            <TableCell className="">{JSON.stringify(event.metadata)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
