import mongoose from 'mongoose';
import env from './env.js';

const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE } = env;

const connectMongo = async () => {
    try {
        const uri = formatUri();

        await mongoose.connect(uri);
    } catch (error) {
        console.error('Error on connect with MongoDB:', error.message);
    }
};

const disconnectMongo = async () => {
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error on disconnect from MongoDB:', error.message);
    }
}

const queryMongo = async (model, query) => {
    try {
        return await model.find(query);
    } catch (error) {
        console.error('Error on query MongoDB:', error.message);
    }
}

const insertMongo = async (model, data) => {
    try {
        return await model.create(data);
    } catch (error) {
        console.error('Error on insert MongoDB:', error.message);
    }
}

function formatUri() {
    if (env.NODE_ENV === 'production') {
        return `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/?retryWrites=true&w=majority&appName=${MONGO_DATABASE}`;
    }

    return `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
}

const mongo = {
    connect: connectMongo,
    disconnect: disconnectMongo,
    query: queryMongo,
    insert: insertMongo,
}

export default mongo;
