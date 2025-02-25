'use client'

import {useRef, useState} from 'react';
import {EventTable} from '@/components/event/event-table';
import {EventFilter} from '@/components/event/event-filter';
import {CreateEventModal} from '@/components/event/create-event-modal';
import {eventApi} from '@/lib/clients/event.api';
import {EventData} from '@/components/event/event-form';
import {toast} from '@/hooks/use-toast';
import {CanceledError} from "axios";

export type Event = EventData;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    try {
      for await (const event of eventApi.stream(abortController.signal)) {
        console.log("Event from API", event);
        setEvents(prev => [event, ...prev.slice(0, 99)]);
      }
    } catch (err: unknown) {
      if (err instanceof CanceledError) {
        return; // just canceled, no need to show error
      } else {
        toast({
          title: 'Erro ao receber eventos',
          variant: 'destructive',
        })
        console.error('Erro ao receber eventos:', err);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const filteredEvents = events.filter(event =>
    (searchTerm === '' ||
      event.type.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === '' || event.type.name === filterType)
  );

  const handleCreateEvent = async (data: Event) => {
    try {
      await eventApi.create(data);
      toast({
        title: 'Evento criado com sucesso!',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Erro ao criar o evento',
        variant: 'destructive',
      });
      console.error('Erro ao criar o evento:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Streaming de Eventos em Tempo Real</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <EventFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
        />
        <div className="flex space-x-2">
          {!isStreaming && (
            <button
              onClick={startStreaming}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Iniciar Streaming
            </button>
          )}
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Parar Streaming
            </button>
          )}
        </div>
        <CreateEventModal onEventCreated={handleCreateEvent}/>
      </div>

      <EventTable events={filteredEvents}/>
    </div>
  );
}
