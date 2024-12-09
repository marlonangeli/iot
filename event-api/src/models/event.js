import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    type: {
        type: Type,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    metadata: {
        type: Map,
        of: String
    },
});

const Type = mongoose.model('Type', new mongoose.Schema({
    name: String,
    description: String
}));

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
