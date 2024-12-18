import {create} from "zustand/index";
import {Location, Pageable} from "@/lib/types";
import {persist} from "zustand/middleware";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {logiApi} from "@/lib/clients/logi.api";

export const useLocationStore = create<{
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
}>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({ selectedLocation: state.selectedLocation }),
    }
  )
);

export const useLocations = (page = 0, size = 10) => {
  return useQuery<Pageable<Location>>({
    queryKey: ['locations', page, size],
    queryFn: async () => await logiApi.locations.list(page, size),
  });
};

export const useLocation = (id?: number) => {
  return useQuery<Location>({
    queryKey: ['location', id],
    queryFn: () => id ? logiApi.locations.get(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, Omit<Location, 'id'>>({
    mutationFn: async (newLocation) => await logiApi.locations.create(newLocation),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, { id: number, location: Partial<Location> }>({
    mutationFn: async ({ id, location }) => await logiApi.locations.update(id, location as Location),
    onSuccess: async (updatedLocation) => {
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
      await queryClient.invalidateQueries({ queryKey: ['location', updatedLocation.id] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => await logiApi.locations.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};
