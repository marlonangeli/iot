import mongoose from 'mongoose';
import env from './env.js';

const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE } = env;

let isConnected = false;

async function connectMongo() {
    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const uri = formatUri();
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            minPoolSize: 3
        });
        isConnected = true;
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        await disconnectMongo();
        throw error;
    }
}

async function disconnectMongo() {
    if (isConnected) {
        try {
            await mongoose.disconnect();
            isConnected = false;
            console.log('MongoDB disconnected');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error.message);
        }
    }
}

function formatUri() {
    if (env.NODE_ENV === 'production') {
        return `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/?retryWrites=true&w=majority&appName=${MONGO_DATABASE}`;
    }
    return `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
}

export default {
    connect: connectMongo,
    disconnect: disconnectMongo
};
