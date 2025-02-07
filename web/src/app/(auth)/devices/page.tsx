'use client';

import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useToast} from "@/hooks/use-toast";
import {useCreateDevice, useDeleteDevice, useDevices, useUpdateDevice} from "@/lib/store/device-store";
import {Device, DeviceType} from "@/lib/types";

import {DeviceSearchFilter} from "@/components/device/device-search-filter";
import {DeviceTable} from "@/components/device/device-table";
import {DeviceForm} from "@/components/device/device-form";

export default function DeviceManagementPage() {
  const {toast} = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DeviceType | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const {data: devicesPage, isLoading, isError} = useDevices();
  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice();
  const deleteDeviceMutation = useDeleteDevice();

  // Filter devices based on search and type
  const filteredDevices = devicesPage?.content.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || device.type === filterType)
  ) || [];

  const handleCreateDevice = (data: Omit<Device, 'id'>) => {
    createDeviceMutation.mutate(data, {
      onSuccess: (createdDevice) => {
        toast({
          title: "Dispositivo criado",
          description: `O dispositivo ${createdDevice.name} foi criado.`
        });
        setIsCreateModalOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Erro criando dispositivo",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleUpdateDevice = (data: Omit<Device, 'id'>) => {
    if (editingDevice) {
      updateDeviceMutation.mutate(
        {id: editingDevice.id!, device: data},
        {
          onSuccess: (updatedDevice) => {
            toast({
              title: "Dispositivo atualizado",
              description: `O dispositivo ${updatedDevice.name} foi atualizado.`
            });
            setEditingDevice(null);
          },
          onError: (error) => {
            toast({
              title: "Erro atualizando dispositivo",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    }
  };

  const handleDeleteDevice = () => {
    if (editingDevice) {
      deleteDeviceMutation.mutate(editingDevice.id!, {
        onSuccess: () => {
          toast({
            title: "Dispositivo deletado",
            description: `Dispositivo ${editingDevice.name} foi deletado.`
          });
          setEditingDevice(null);
        },
        onError: (error) => {
          toast({
            title: "Erro deletando dispositivo",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  };

  if (isLoading) return <div>Carregando dispositivos...</div>;
  if (isError) return <div>Erro carregando dispositivos</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gerenciamento de dispositivos</h1>

      {/* Search and Filter Component */}
      <DeviceSearchFilter
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterType}
        onAddDevice={() => setIsCreateModalOpen(true)}
      />

      {/* Device Table Component */}
      <DeviceTable
        devices={filteredDevices}
        onEditDevice={setEditingDevice}
      />

      {/* Create Device Dialog */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar novo dispositivp</DialogTitle>
            <DialogDescription>Digite as informações do novo dispositivo.</DialogDescription>
          </DialogHeader>
          <DeviceForm
            mode="create"
            onSubmit={handleCreateDevice}
            isLoading={createDeviceMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog
        open={!!editingDevice}
        onOpenChange={(open) => {
          if (!open) setEditingDevice(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar dispositivo</DialogTitle>
            <DialogDescription>Altere as informações do dispositivo selecionado.</DialogDescription>
          </DialogHeader>
          <DeviceForm
            mode="edit"
            initialData={editingDevice || undefined}
            onSubmit={handleUpdateDevice}
            onDelete={handleDeleteDevice}
            isLoading={
              updateDeviceMutation.isPending ||
              deleteDeviceMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
