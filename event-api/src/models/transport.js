const mongoose = require('mongoose');

const TransportTrackingSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    vehicleInfo: {
        vehicleId: String,
        type: {
            type: String,
            enum: ['truck', 'ship', 'train', 'airplane']
        },
        licensePlate: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: String,
        speed: {
            value: Number,
            unit: {
                type: String,
                enum: ['km/h', 'mph'],
                default: 'km/h'
            }
        }
    },
    cargoStatus: {
        loaded: Boolean,
        temperature: Number,
        humidity: Number
    },
    route: {
        origin: String,
        destination: String,
        plannedRoute: [
            {
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point'
                },
                coordinates: [Number]
            }
        ]
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    alerts: [{
        type: String
    }]
}, {
    indexes: [{ 'location': '2dsphere' }]
});

const Transport = mongoose.model('Transport', TransportTrackingSchema);

module.exports = Transport;
