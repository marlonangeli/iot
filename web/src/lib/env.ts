// validate environment variables with zod
import {z} from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  WEB_APP_PORT: z.string().default('3000'),
  NEXT_PUBLIC_AUTH_API_URL: z.string().default('http://localhost:5000'),
  NEXT_PUBLIC_LOGI_API_URL: z.string().default('http://localhost:8080'),
  NEXT_PUBLIC_EVENT_API_URL: z.string().default('http://localhost:8000'),
});

export const env = EnvSchema.parse(process.env);
