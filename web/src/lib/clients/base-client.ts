import axios, { AxiosError, AxiosInstance } from 'axios';

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export interface ValidationError {
  status: string;
  message: string;
  timestamp: string;
  errors: Record<string, string>;
}

export class ApiError extends Error {
  public readonly isApiError = true;
  public readonly status?: number;
  public readonly errors?: Record<string, string>;

  constructor(message: string, status?: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function handleApiError(error: AxiosError): never {
  if (error.response?.data && (error.response.data as ProblemDetail).status) {
    const pd = error.response.data as ProblemDetail;
    throw new ApiError(pd.title, pd.status, pd.detail ? { detail: pd.detail } : undefined);
  }
  if (error.response?.data && (error.response.data as ValidationError).errors) {
    const ve = error.response.data as ValidationError;
    throw new ApiError(ve.message, 400, ve.errors);
  }
  throw new ApiError(error.message, error.response?.status);
}

export const createApiClient = (baseURL: string, options?: { streaming?: boolean }): AxiosInstance => {
  const streaming = options?.streaming ?? false;
  const apiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: streaming ? 0 : 5000,
    headers: streaming ? { Accept: 'application/x-ndjson' } : { Accept: 'application/json' },
    ...(streaming ? { responseType: 'stream', transformResponse: [(data) => data] } : {}),
  });
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      handleApiError(error);
    }
  );
  return apiClient;
};
