import axios, {AxiosError, AxiosInstance} from 'axios';
import {
  Device,
  DeviceSchema,
  Driver,
  DriverSchema,
  Location,
  LocationSchema,
  Pageable,
  PageableSchema,
  Transaction,
  TransactionSchema,
  Vehicle,
  VehicleSchema
} from "@/lib/types";
import {env} from "@/lib/env";
import {CreateVehicle, CreateVehicleSchema} from "@/lib/clients/logi.types";

interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

interface ValidationError {
  status: string;
  message: string;
  timestamp: string;
  errors: Record<string, string>;
}

class ApiError extends Error {
  public readonly isApiError = true;
  public readonly status?: number;
  public readonly errors?: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  hasValidationError(field?: string): boolean {
    if (!this.errors) return false;
    return field ? !!this.errors[field] : Object.keys(this.errors).length > 0;
  }
}


function handleApiError(error: AxiosError): never {
  if (error.response?.data && (error.response.data as ProblemDetail).status) {
    const problemDetail = error.response.data as ProblemDetail;
    throw new ApiError(
      problemDetail.title,
      problemDetail.status,
      problemDetail.detail ? {detail: problemDetail.detail} : undefined
    );
  }

  if (error.response?.data && (error.response.data as ValidationError).errors) {
    const validationError = error.response.data as ValidationError;
    throw new ApiError(
      validationError.message,
      400,
      validationError.errors
    );
  }

  throw new ApiError(
    error.message,
    error.response?.status
  );
}

interface StatusVersion {
  status: 'OK' | 'ERROR';
  version: string | null;
}

interface StatusResponse {
  status: 'OK' | 'WARNING';
  database: StatusVersion;
  messageBroker: StatusVersion;
  commitHash: string;
  apiVersion: string;
}

export const createApiClient = (baseURL: string) => {
  const apiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    status: {
      /**
       * Get system status and versions
       * @returns System status details
       */
      get: async (): Promise<StatusResponse> => {
        try {
          const response = await apiClient.get('/api/status');
          return response.data as StatusResponse;
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      }
    },

    devices: {
      /**
       * List devices with pagination
       * @param page Page number (zero-indexed)
       * @param size Number of items per page
       * @returns Paginated list of devices
       */
      list: async (page = 0, size = 10): Promise<Pageable<Device>> => {
        try {
          const response = await apiClient.get('/api/devices', {params: {page, size}});
          const pageable = PageableSchema.parse(response.data);
          return {
            ...pageable,
            content: DeviceSchema.array().parse(pageable.content)
          };
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Get a specific device by ID
       * @param id Device ID
       * @returns Device details
       */
      get: async (id: number): Promise<Device> => {
        try {
          const response = await apiClient.get(`/api/devices/${id}`);
          return DeviceSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Create a new device
       * @param data Device data
       * @returns Created device
       */
      create: async (data: Device): Promise<Device> => {
        try {
          const validatedData = DeviceSchema.omit({id: true}).parse(data);
          const response = await apiClient.post('/api/devices', validatedData);
          return DeviceSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Update an existing device
       * @param id Device ID
       * @param data Updated device data
       * @returns Updated device
       */
      update: async (id: number, data: Device): Promise<Device> => {
        try {
          const validatedData = DeviceSchema.omit({id: true}).parse(data);
          const response = await apiClient.put(`/api/devices/${id}`, validatedData);
          return DeviceSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Delete a device
       * @param id Device ID
       */
      delete: async (id: number): Promise<void> => {
        try {
          await apiClient.delete(`/api/devices/${id}`);
        } catch (error) {
          handleApiError(error as AxiosError);
        }
      }
    },

    // Drivers endpoint
    drivers: {
      /**
       * List drivers with pagination
       * @param page Page number (zero-indexed)
       * @param size Number of items per page
       */
      list: async (page = 0, size = 10): Promise<Pageable<Driver>> => {
        try {
          const response = await apiClient.get('/api/drivers', {params: {page, size}});
          const pageable = PageableSchema.parse(response.data);
          return {
            ...pageable,
            content: DriverSchema.array().parse(pageable.content)
          };
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Get a specific driver by ID
       * @param id Driver ID
       */
      get: async (id: number): Promise<Driver> => {
        try {
          const response = await apiClient.get(`/api/drivers/${id}`);
          return DriverSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Create a new driver
       * @param data Driver data
       */
      create: async (data: Driver): Promise<Driver> => {
        try {
          const validatedData = DriverSchema.omit({id: true}).parse(data);
          const response = await apiClient.post('/api/drivers', validatedData);
          return DriverSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Update an existing driver
       * @param id Driver ID
       * @param data Updated driver data
       */
      update: async (id: number, data: Driver): Promise<Driver> => {
        try {
          const validatedData = DriverSchema.omit({id: true}).parse(data);
          const response = await apiClient.put(`/api/drivers/${id}`, validatedData);
          return DriverSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Delete a driver
       * @param id Driver ID
       */
      delete: async (id: number): Promise<void> => {
        try {
          await apiClient.delete(`/api/drivers/${id}`);
        } catch (error) {
          handleApiError(error as AxiosError);
        }
      }
    },

    // Locations endpoint
    locations: {
      /**
       * List locations with pagination
       * @param page Page number (zero-indexed)
       * @param size Number of items per page
       */
      list: async (page = 0, size = 10): Promise<Pageable<Location>> => {
        try {
          const response = await apiClient.get('/api/locations', {params: {page, size}});
          const pageable = PageableSchema.parse(response.data);
          return {
            ...pageable,
            content: LocationSchema.array().parse(pageable.content)
          };
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Get a specific location by ID
       * @param id Location ID
       */
      get: async (id: number): Promise<Location> => {
        try {
          const response = await apiClient.get(`/api/locations/${id}`);
          return LocationSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Create a new location
       * @param data Location data
       */
      create: async (data: Location): Promise<Location> => {
        try {
          const validatedData = LocationSchema.omit({id: true}).parse(data);
          const response = await apiClient.post('/api/locations', validatedData);
          return LocationSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Update an existing location
       * @param id Location ID
       * @param data Updated location data
       */
      update: async (id: number, data: Location): Promise<Location> => {
        try {
          const validatedData = LocationSchema.omit({id: true}).parse(data);
          const response = await apiClient.put(`/api/locations/${id}`, validatedData);
          return LocationSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Delete a location
       * @param id Location ID
       */
      delete: async (id: number): Promise<void> => {
        try {
          await apiClient.delete(`/api/locations/${id}`);
        } catch (error) {
          handleApiError(error as AxiosError);
        }
      }
    },

    // Transactions endpoint
    transactions: {
      /**
       * List transactions with pagination
       * @param page Page number (zero-indexed)
       * @param size Number of items per page
       */
      list: async (page = 0, size = 10): Promise<Pageable<Transaction>> => {
        try {
          const response = await apiClient.get('/api/transactions', {params: {page, size}});
          const pageable = PageableSchema.parse(response.data);
          return {
            ...pageable,
            content: TransactionSchema.array().parse(pageable.content)
          };
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Get a specific transaction by ID
       * @param id Transaction ID
       */
      get: async (id: number): Promise<Transaction> => {
        try {
          const response = await apiClient.get(`/api/transactions/${id}`);
          return TransactionSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Create a new transaction
       * @param data Transaction data
       */
      create: async (data: Transaction): Promise<Transaction> => {
        try {
          const validatedData = TransactionSchema.omit({id: true}).parse(data);
          const response = await apiClient.post('/api/transactions', validatedData);
          return TransactionSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Update an existing transaction
       * @param id Transaction ID
       * @param data Updated transaction data
       */
      update: async (id: number, data: Transaction): Promise<Transaction> => {
        try {
          const validatedData = TransactionSchema.omit({id: true}).parse(data);
          const response = await apiClient.put(`/api/transactions/${id}`, validatedData);
          return TransactionSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Delete a transaction
       * @param id Transaction ID
       */
      delete: async (id: number): Promise<void> => {
        try {
          await apiClient.delete(`/api/transactions/${id}`);
        } catch (error) {
          handleApiError(error as AxiosError);
        }
      }
    },

    // Vehicles endpoint
    vehicles: {
      /**
       * List vehicles with pagination
       * @param page Page number (zero-indexed)
       * @param size Number of items per page
       */
      list: async (page = 0, size = 10): Promise<Pageable<Vehicle>> => {
        try {
          const response = await apiClient.get('/api/vehicles', {params: {page, size}});
          const pageable = PageableSchema.parse(response.data);
          return {
            ...pageable,
            content: VehicleSchema.array().parse(pageable.content)
          };
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Get a specific vehicle by ID
       * @param id Vehicle ID
       */
      get: async (id: number): Promise<Vehicle> => {
        try {
          const response = await apiClient.get(`/api/vehicles/${id}`);
          return VehicleSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Create a new vehicle
       * @param data Vehicle data
       */
      create: async (data: CreateVehicle): Promise<Vehicle> => {
        try {
          const validatedData = CreateVehicleSchema.parse(data);

          const response = await apiClient.post('/api/vehicles', validatedData);
          return VehicleSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Update an existing vehicle
       * @param id Vehicle ID
       * @param data Updated vehicle data
       */
      update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
        try {
          console.log(data);
          const validatedData = VehicleSchema.omit({id: true}).parse(data);
          const response = await apiClient.put(`/api/vehicles/${id}`, validatedData);
          return VehicleSchema.parse(response.data);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },

      /**
       * Delete a vehicle
       * @param id Vehicle ID
       */
      delete: async (id: number): Promise<void> => {
        try {
          await apiClient.delete(`/api/vehicles/${id}`);
        } catch (error) {
          handleApiError(error as AxiosError);
        }
      }
    },
  };
};

export const logiApi = createApiClient(env.NEXT_PUBLIC_LOGI_API_URL);
