import {VehicleSchema} from "@/lib/types";
import {z} from "zod";

export const CreateVehicleSchema = VehicleSchema.pick({
  name: true,
  plate: true
}).extend({
  deviceId: z.number().int().positive()
});

export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;
