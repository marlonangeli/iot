import {create} from "zustand/index";
import {Pageable, Transaction} from "@/lib/types";
import {persist} from "zustand/middleware";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {logiApi} from "@/lib/clients/logi.api";

export const useTransactionStore = create<{
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (transaction: Transaction | null) => void;
}>()(
  persist(
    (set) => ({
      selectedTransaction: null,
      setSelectedTransaction: (transaction) => set({ selectedTransaction: transaction }),
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({ selectedTransaction: state.selectedTransaction }),
    }
  )
);

export const useTransactions = (page = 0, size = 10) => {
  return useQuery<Pageable<Transaction>>({
    queryKey: ['transactions', page, size],
    queryFn: async () => await logiApi.transactions.list(page, size),
  });
};

export const useTransaction = (id?: number) => {
  return useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => id ? logiApi.transactions.get(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, Omit<Transaction, 'id'>>({
    mutationFn: async (newTransaction) => await logiApi.transactions.create(newTransaction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { id: number, transaction: Partial<Transaction> }>({
    mutationFn: async ({ id, transaction }) => await logiApi.transactions.update(id, transaction as Transaction),
    onSuccess: async (updatedTransaction) => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transaction', updatedTransaction.id] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => await logiApi.transactions.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
