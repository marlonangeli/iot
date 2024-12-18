import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Device, Pageable,} from '@/lib/types';
import {logiApi} from '@/lib/clients/logi.api';

export const useDeviceStore = create<{
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
}>()(
  persist(
    (set) => ({
      selectedDevice: null,
      setSelectedDevice: (device) => set({selectedDevice: device}),
    }),
    {
      name: 'device-storage',
      partialize: (state) => ({selectedDevice: state.selectedDevice}),
    }
  )
);

export const useDevices = (page = 0, size = 10) => {
  return useQuery<Pageable<Device>>({
    queryKey: ['devices', page, size],
    queryFn: async () =>  await logiApi.devices.list(page, size),
  });
};

export const useDevice = (id?: number) => {
  return useQuery<Device>({
    queryKey: ['device', id],
    queryFn: () => id ? logiApi.devices.get(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<Device, Error, Omit<Device, 'id'>>({
    mutationFn: async (newDevice) => await logiApi.devices.create(newDevice),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['devices']});
    },
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<Device, Error, { id: number, device: Partial<Device> }>({
    mutationFn: async ({id, device}) => await logiApi.devices.update(id, device as Device),
    onSuccess: async (updatedDevice) => {
      await queryClient.invalidateQueries({queryKey: ['devices']});
      await queryClient.invalidateQueries({queryKey: ['device', updatedDevice.id]});
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => await logiApi.devices.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['devices']});
    },
  });
};
