import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        trim: true
    },
    deviceType: {
        type: String,
        required: true,
        enum: ['sensor', 'tracker', 'warehouse', 'environmental']
    },
    metadata: {
        type: Map,
        of: String
    },
    batteryStatus: {
        level: {
            type: Number,
            min: 0,
            max: 100
        },
        isCharging: Boolean,
        lastCharged: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'error'],
        default: 'active'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    indexes: [{ location: '2dsphere' }],
});

const Device = mongoose.model('Device', deviceSchema);

export default Device;
