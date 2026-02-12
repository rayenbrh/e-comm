import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { OrdersResponse, Order, Address } from '@/types';
import toast from 'react-hot-toast';

interface CreateOrderData {
  items: {
    product: string;
    quantity: number;
    variantAttributes?: Record<string, string>;
  }[];
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
    address: Address;
  };
  notes?: string;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse>('/orders');
      return data.orders;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; order: Order }>(`/orders/${id}`);
      return data.order;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const { data } = await api.post('/orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create order';
      const errors = error?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        toast.error(`${errorMessage}: ${errors.map((e: any) => e.message).join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
