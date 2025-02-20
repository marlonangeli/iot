import { Event } from '@/lib/types';
import { createApiClient } from '@/lib/clients/base-client';

export const eventApi = {
  stream: async function* streamEvents(cancellationSignal?: AbortSignal): AsyncGenerator<Event, void, unknown> {
    let stream: ReadableStream;
    if (typeof window !== 'undefined') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EVENT_API_URL}/api/events/stream`, {
        headers: { Accept: 'application/x-ndjson' },
        signal: cancellationSignal,
      });
      if (!response.body) throw new Error('ReadableStream não disponível neste navegador.');
      stream = response.body;
    } else {
      const apiClient = createApiClient(process.env.NEXT_PUBLIC_EVENT_API_URL as string, { streaming: true });
      const response = await apiClient.get('/api/events/stream', { signal: cancellationSignal });
      stream = response.data;
    }
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            yield JSON.parse(line) as Event;
          } catch (err) {
            console.error('Erro no parse:', err);
          }
        }
      }
    }
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer) as Event;
      } catch (err) {
        console.error('Erro no parse final:', err);
      }
    }
  },

  create: async function createEvent(data: Omit<Event, 'id'>): Promise<Event> {
    const apiClient = createApiClient(process.env.NEXT_PUBLIC_EVENT_API_URL as string);
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },
};
