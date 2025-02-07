import { create } from "zustand/index";
import { Driver, Pageable } from "@/lib/types";
import { persist } from "zustand/middleware";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logiApi } from "@/lib/clients/logi.api";

export const useDriverStore = create<{
  selectedDriver: Driver | null;
  setSelectedDriver: (driver: Driver | null) => void;
}>()(
  persist(
    (set) => ({
      selectedDriver: null,
      setSelectedDriver: (driver) => set({ selectedDriver: driver }),
    }),
    {
      name: "driver-storage",
      partialize: (state) => ({ selectedDriver: state.selectedDriver }),
    }
  )
);

export const useDrivers = (page = 0, size = 10) => {
  return useQuery<Pageable<Driver>>({
    queryKey: ["drivers", page, size],
    queryFn: async () => await logiApi.drivers.list(page, size),
  });
};

export const useDriver = (id?: number) => {
  return useQuery<Driver>({
    queryKey: ["driver", id],
    queryFn: () => (id ? logiApi.drivers.get(id) : Promise.reject("No ID provided")),
    enabled: !!id,
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<Driver, Error, Omit<Driver, "id">>({
    mutationFn: async (newDriver) => await logiApi.drivers.create(newDriver),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<Driver, Error, { id: number; driver: Partial<Driver> }>({
    mutationFn: async ({ id, driver }) => await logiApi.drivers.update(id, driver as Driver),
    onSuccess: async (updatedDriver) => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
      await queryClient.invalidateQueries({ queryKey: ["driver", updatedDriver.id] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => await logiApi.drivers.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};
