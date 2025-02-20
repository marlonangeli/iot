'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventForm, EventData } from "@/components/event/event-form";

interface CreateEventModalProps {
  onEventCreated: (eventData: EventData) => void;
}

export function CreateEventModal({ onEventCreated }: CreateEventModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Criar Evento</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Evento</DialogTitle>
          </DialogHeader>
          <EventForm
            onSubmit={(data) => {
              onEventCreated(data);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
