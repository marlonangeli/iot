import {z} from 'zod';

export const DeviceTypeEnum = z.enum(['TRACKER', 'SENSOR', 'GATEWAY', 'WEATHER']);
export type DeviceType = z.infer<typeof DeviceTypeEnum>;

export const DeviceStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR']);
export type DeviceStatus = z.infer<typeof DeviceStatusEnum>;

export const LocationTypeEnum = z.enum(['WAREHOUSE', 'DEPOT', 'DISTRIBUTION_CENTER', 'CUSTOMER_LOCATION']);
export type LocationType = z.infer<typeof LocationTypeEnum>;

export const DeviceSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {message: "Name must be at least 2 characters"}).max(64),
  location: z.object({
    id: z.number().nullable().optional(),
    name: z.string().optional()
  }).nullable().optional(),
  type: DeviceTypeEnum,
  status: DeviceStatusEnum,
  lastTracking: z.string().datetime().nullable().optional()
});

export const DriverSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {message: "Name must be at least 2 characters"}).max(64),
  transactions: z.array(z.object({
    id: z.number().optional()
  })).optional()
});

export const LocationSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {message: "Name must be at least 2 characters"}).max(64),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: LocationTypeEnum,
  devices: z.array(z.object({
    id: z.number().optional()
  })).optional()
});

export const TransactionSchema = z.object({
  id: z.number().optional(),
  originLocation: z.object({
    id: z.number(),
    name: z.string().optional()
  }),
  destinyLocation: z.object({
    id: z.number(),
    name: z.string().optional()
  }),
  vehicle: z.object({
    id: z.number(),
    name: z.string().optional()
  }),
  driver: z.object({
    id: z.number(),
    name: z.string().optional()
  }),
  dispatchTime: z.string().datetime().nullable().optional(),
  arrivalTime: z.string().datetime().nullable().optional(),
  cargoDescription: z.string().max(80).nullable().optional()
});

export const VehicleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(32),
  plate: z.string().regex(/^[A-Z]{3}\d{4}$/, {message: "Plate must be in format ABC1234"}),
  device: z.object({
    id: z.number(),
    name: z.string().optional()
  }),
  transactions: z.array(z.object({
    id: z.number().optional()
  })).optional()
});

export const EventSchema = z.object({
  type: z.object({
    name: z.string(),
    description: z.string().optional()
  }),
  date: z.string().datetime(),
  metadata: z.record(z.string(), z.string()).optional()
});

export const SortSchema = z.object({
  unsorted: z.boolean(),
  sorted: z.boolean(),
  empty: z.boolean()
});

export const PageableSchema = z.object({
  content: z.array(z.any()),
  pageable: z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    sort: SortSchema,
    offset: z.number(),
    paged: z.boolean(),
    unpaged: z.boolean()
  }),
  totalElements: z.number(),
  totalPages: z.number(),
  last: z.boolean(),
  numberOfElements: z.number(),
  first: z.boolean(),
  size: z.number(),
  number: z.number(),
  sort: SortSchema,
  empty: z.boolean()
});


export type Sort = z.infer<typeof SortSchema>;
export type Pageable<T> = z.infer<typeof PageableSchema> & {
  content: T[];
};
export type Device = z.infer<typeof DeviceSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Event = z.infer<typeof EventSchema>;
