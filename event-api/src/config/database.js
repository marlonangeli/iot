import mongoose from 'mongoose';
import env from './env.js';

const { MONGO_HOST, MONGO_PORT, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_DATABASE } = env();

const connectMongo = async () => {
    try {

        const uri = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_INITDB_DATABASE}`;

        await mongoose.connect(uri);
        console.log('Connection with MongoDB established');
    } catch (error) {
        console.error('Error on connect with MongoDB:', error.message);
    }
};

const disconnectMongo = async () => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
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

const mongo = {
    connect: connectMongo,
    disconnect: disconnectMongo,
    query: queryMongo,
    insert: insertMongo,
}

export default mongo;
