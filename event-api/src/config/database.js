const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connection with MongoDB established');
    } catch (error) {
        console.error('Error on connect with MongoDB:', error.message);
    }
};

module.exports = connectMongo;
