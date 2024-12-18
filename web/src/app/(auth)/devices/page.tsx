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

  // Create device handler
  const handleCreateDevice = (data: Omit<Device, 'id'>) => {
    createDeviceMutation.mutate(data, {
      onSuccess: (createdDevice) => {
        toast({
          title: "Device Created Successfully",
          description: `Device ${createdDevice.name} has been added.`
        });
        setIsCreateModalOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error Creating Device",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  // Update device handler
  const handleUpdateDevice = (data: Omit<Device, 'id'>) => {
    if (editingDevice) {
      updateDeviceMutation.mutate(
        {id: editingDevice.id!, device: data},
        {
          onSuccess: (updatedDevice) => {
            toast({
              title: "Device Updated Successfully",
              description: `Device ${updatedDevice.name} has been updated.`
            });
            setEditingDevice(null);
          },
          onError: (error) => {
            toast({
              title: "Error Updating Device",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    }
  };

  // Delete device handler
  const handleDeleteDevice = () => {
    if (editingDevice) {
      deleteDeviceMutation.mutate(editingDevice.id!, {
        onSuccess: () => {
          toast({
            title: "Device Deleted",
            description: `Device ${editingDevice.name} has been deleted.`
          });
          setEditingDevice(null);
        },
        onError: (error) => {
          toast({
            title: "Error Deleting Device",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  };

  if (isLoading) return <div>Loading devices...</div>;
  if (isError) return <div>Error loading devices</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Device Management</h1>

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
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>Enter the details for the new device.</DialogDescription>
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
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>Modify the details for the selected device.</DialogDescription>
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
