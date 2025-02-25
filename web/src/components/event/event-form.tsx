'use client'

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EventSchema = z.object({
  type: z.object({
    name: z.string(),
    description: z.string().optional()
  }),
  date: z.string().datetime(),
  metadata: z.record(z.string(), z.string()).optional()
});

export type EventData = z.infer<typeof EventSchema>;

interface EventFormProps {
  onSubmit: (data: EventData) => void;
  isLoading?: boolean;
}

export function EventForm({ onSubmit, isLoading = false }: EventFormProps) {
  const form = useForm<EventData>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      type: { name: '', description: '' },
      date: new Date().toISOString(),
      metadata: {}
    }
  });

  const handleSubmit = (data: EventData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Evento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="alert">Aviso</SelectItem>
                  <SelectItem value="warning">Erro</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Selecione o tipo do evento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Evento</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().slice(0,16) : ''}
                  onChange={(e) => {
                    const isoString = new Date(e.target.value).toISOString();
                    field.onChange(isoString);
                  }}
                />
              </FormControl>
              <FormDescription>Escolha a data e hora do evento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Tipo (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Descrição do tipo" {...field} />
              </FormControl>
              <FormDescription>Insira uma descrição opcional para o tipo do evento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar Evento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
