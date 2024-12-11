import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    weatherData: {
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
        },
        pressure: {
            value: Number,
            unit: {
                type: String,
                enum: ['hPa', 'kPa', 'mbar'],
                default: 'hPa'
            }
        },
        windSpeed: {
            value: Number,
            unit: {
                type: String,
                enum: ['km/h', 'm/s', 'mph'],
                default: 'km/h'
            }
        }
    },
    additionalSensors: {
        type: Map,
        of: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    errors: [{
        type: String
    }]
});

const Environment = mongoose.model('Environment', environmentSchema)

export default Environment;
