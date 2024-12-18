import axios from 'axios';
import {Device, Pageable} from "@/lib/types";

export const createApiClient = (baseURL: string) => {
  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    devices: {
      list: async (page = 0, size = 10) => await listDevices(page, size),
      get: async (id: number) => await getDevice(id),
      create: async (data: Device) => await createDevice(data),
      update: async (id: number, data: Device) => await updateDevice(id, data),
      delete: async (id: number) => await deleteDevice(id),
    }
  }

  async function listDevices(page: number, size: number): Promise<Pageable<Device>> {
    const response = await apiClient.get('/api/devices', {params: {page, size}});
    console.log("Resposta da API Spring:", response.data);
    return response.data as Pageable<Device>;
  }

  async function getDevice(id: number): Promise<Device> {
    const response = await apiClient.get(`/api/devices/${id}`);
    return response.data as Device;
  }

  async function createDevice(data: Device): Promise<Device> {
    const response = await apiClient.post('/api/devices', data);
    return response.data as Device;
  }

  async function updateDevice(id: number, data: Device): Promise<Device> {
    const response = await apiClient.put(`/api/devices/${id}`, data);
    return response.data as Device;
  }

  async function deleteDevice(id: number): Promise<void> {
    await apiClient.delete(`/api/devices/${id}`);
  }
};

export const logiApi = createApiClient(process.env.NEXT_PUBLIC_LOGI_API_URL || '');
