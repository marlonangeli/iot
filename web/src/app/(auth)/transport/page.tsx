"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateVehicle, useDeleteVehicle, useUpdateVehicle, useVehicles } from "@/lib/store/vehicle-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "@/components/vehicle/vehicle-form";
import { CreateVehicle } from "@/lib/clients/logi.types";
import { VehicleTable } from "@/components/vehicle/vehicle-table";

export default function VehicleManagementPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const { data: vehiclesPage, isLoading, isError } = useVehicles();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const filteredVehicles =
    vehiclesPage?.content.filter(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleCreateVehicle = (data: CreateVehicle) => {
    createVehicleMutation.mutate(data, {
      onSuccess: (createdVehicle) => {
        toast({
          title: "Veículo criado",
          description: `Veículo ${createdVehicle.name} foi adicionado.`,
        });
        setIsCreateModalOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Erro ao criar veículo",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleUpdateVehicle = (data: Partial<Vehicle>) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate(
        { id: editingVehicle.id!, vehicle: data },
        {
          onSuccess: (updatedVehicle) => {
            toast({
              title: "Veículo atualizado",
              description: `O veículo ${updatedVehicle.name} foi atualizado.`,
            });
            setEditingVehicle(null);
          },
          onError: (error) => {
            toast({
              title: "Erro atualizando veículo",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const handleDeleteVehicle = () => {
    if (editingVehicle) {
      deleteVehicleMutation.mutate(editingVehicle.id!, {
        onSuccess: () => {
          toast({
            title: "Veículo deletado",
            description: `O veículo ${editingVehicle.name} foi deletado.`,
          });
          setEditingVehicle(null);
        },
        onError: (error) => {
          toast({
            title: "Erro deletando veículo",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading) return <div>Carregando veículos...</div>;
  if (isError) return <div>Erro ao carregar veículos</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gerenciamento de veículos</h1>

      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar veículos por nome ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Adicionar</Button>
      </div>

      <VehicleTable vehicles={filteredVehicles} onEditVehicle={setEditingVehicle} />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar novo veículo</DialogTitle>
            <DialogDescription>Digite os detalhes do novo veículo.</DialogDescription>
          </DialogHeader>
          <VehicleForm mode="create" onSubmit={handleCreateVehicle} isLoading={createVehicleMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingVehicle}
        onOpenChange={(open) => {
          if (!open) setEditingVehicle(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar veículo</DialogTitle>
            <DialogDescription>Altere as informações do veículo selecionado.</DialogDescription>
          </DialogHeader>
          <VehicleForm
            mode="edit"
            initialData={editingVehicle || undefined}
            onUpdate={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
            isLoading={updateVehicleMutation.isPending || deleteVehicleMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
