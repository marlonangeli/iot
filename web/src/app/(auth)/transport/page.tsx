'use client';

import {useState} from 'react';
import {Vehicle} from "@/lib/types";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useToast} from "@/hooks/use-toast";
import {useCreateVehicle, useDeleteVehicle, useUpdateVehicle, useVehicles} from "@/lib/store/vehicle-store";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {VehicleForm} from "@/components/vehicle/vehicle-form";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {CreateVehicle} from "@/lib/clients/logi.types";

export default function VehicleManagementPage() {
  const {toast} = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const {data: vehiclesPage, isLoading, isError} = useVehicles();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const filteredVehicles = vehiclesPage?.content.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateVehicle = (data: CreateVehicle) => {
    createVehicleMutation.mutate(data, {
      onSuccess: (createdVehicle) => {
        toast({
          title: "Vehicle Created",
          description: `Vehicle ${createdVehicle.name} has been added.`
        });
        setIsCreateModalOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error Creating Vehicle",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleUpdateVehicle = (data: Partial<Vehicle>) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate(
        {id: editingVehicle.id!, vehicle: data},
        {
          onSuccess: (updatedVehicle) => {
            toast({
              title: "Vehicle Updated",
              description: `Vehicle ${updatedVehicle.name} has been updated.`
            });
            setEditingVehicle(null);
          },
          onError: (error) => {
            toast({
              title: "Error Updating Vehicle",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    }
  };

  const handleDeleteVehicle = () => {
    if (editingVehicle) {
      deleteVehicleMutation.mutate(editingVehicle.id!, {
        onSuccess: () => {
          toast({
            title: "Vehicle Deleted",
            description: `Vehicle ${editingVehicle.name} has been deleted.`
          });
          setEditingVehicle(null);
        },
        onError: (error) => {
          toast({
            title: "Error Deleting Vehicle",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  };

  if (isLoading) return <div>Loading vehicles...</div>;
  if (isError) return <div>Error loading vehicles</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vehicle Management</h1>

      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vehicles by name or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Add Vehicle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Assigned Device</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>{vehicle.device?.name || 'None'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingVehicle(vehicle)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details for the new vehicle.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            mode="create"
            onSubmit={handleCreateVehicle}
            isLoading={createVehicleMutation.isPending}
          />
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
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Modify the details for the selected vehicle.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            mode="edit"
            initialData={editingVehicle || undefined}
            onUpdate={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
            isLoading={
              updateVehicleMutation.isPending ||
              deleteVehicleMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
