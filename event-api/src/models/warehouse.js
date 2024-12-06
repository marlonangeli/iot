const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    siloInfo: {
        siloId: String,
        location: String,
        capacity: {
            value: Number,
            unit: {
                type: String,
                enum: ['ton', 'kg', 'liter']
            }
        }
    },
    productStatus: {
        type: String,
        enum: ['grain', 'liquid', 'powder', 'other']
    },
    measurements: {
        currentLevel: {
            value: Number,
            percentage: Number
        },
        temperature: {
            value: Number,
            unit: {
                type: String,
                enum: ['C', 'F'],
                default: 'C'
            }
        },
        humidity: {
            value: Number,
            unit: {
                type: String,
                enum: ['%'],
                default: '%'
            }
        }
    },
    alerts: [{
        type: String
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
