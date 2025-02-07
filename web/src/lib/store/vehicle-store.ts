import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Vehicle,
  Pageable
} from '@/lib/types';
import { logiApi } from '@/lib/clients/logi.api';
import {CreateVehicle} from "@/lib/clients/logi.types";

export const useVehicleStore = create<{
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
}>()(
  persist(
    (set) => ({
      selectedVehicle: null,
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
    }),
    {
      name: 'vehicle-storage',
      partialize: (state) => ({ selectedVehicle: state.selectedVehicle }),
    }
  )
);

export const useVehicles = (page = 0, size = 10) => {
  return useQuery<Pageable<Vehicle>>({
    queryKey: ['vehicles', page, size],
    queryFn: async () => await logiApi.vehicles.list(page, size),
  });
};

export const useVehicle = (id?: number) => {
  return useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => id ? logiApi.vehicles.get(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, Error, CreateVehicle>({
    mutationFn: async (newVehicle) => {
      const vehicleData = {
        name: newVehicle.name,
        plate: newVehicle.plate,
        deviceId: newVehicle.deviceId
      };
      return await logiApi.vehicles.create(vehicleData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, Error, { id: number, vehicle: Partial<Vehicle> }>({
    mutationFn: async ({ id, vehicle }) => await logiApi.vehicles.update(id, vehicle as Vehicle),
    onSuccess: async (updatedVehicle) => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicle', updatedVehicle.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => await logiApi.vehicles.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
