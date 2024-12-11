import {z} from 'zod';
import {configDotenv} from "dotenv";

const envSchema = z.object({
    DOCKER: z.any().optional(),
    NODE_ENV: z.string().min(1, 'Node environment is required'),
    COMMIT_HASH: z.string().optional(),

    MONGO_USER: z.string().min(1, 'MongoDB user is required'),
    MONGO_PASSWORD: z.string().min(1, 'MongoDB password is required'),
    MONGO_DATABASE: z.string().optional().or(z.string().min(1, 'MongoDB database is required')),
    MONGO_HOST: z.string().min(1, 'MongoDB host is required'),
    MONGO_PORT: z.string().regex(/^\d+$/, 'MongoDB port must be a valid number'),

    RABBITMQ_USER: z.string().min(1, 'RabbitMQ user is required'),
    RABBITMQ_PASS: z.string().min(1, 'RabbitMQ password is required'),
    RABBITMQ_VHOST: z.string().min(1, 'RabbitMQ virtual host is required'),
    RABBITMQ_HOST: z.string().min(1, 'RabbitMQ host is required'),
    RABBITMQ_PORT: z.string().regex(/^\d+$/, 'RabbitMQ port must be a valid number'),

    NEW_RELIC_LICENSE_KEY: z.string().optional(),
    NEW_RELIC_USER_KEY: z.string().optional()
});

function configure() {
    try {
        configDotenv();

        let env = envSchema.parse(process.env);

        if (!env.DOCKER) {
            env.MONGO_HOST = 'localhost';
            env.RABBITMQ_HOST = 'localhost';
            env.COMMIT_HASH = 'development';
        }

        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err => ({
                path: err.path.join('.'), message: err.message
            }));

            console.error('Environment configuration error:', formattedErrors);
            throw new Error('Invalid environment configuration');
        }
        throw error;
    }
}

const env = configure();

export default env;
