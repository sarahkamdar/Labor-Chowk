const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    wages: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    workType: {
        type: String,
        required: true,
        enum: ['plumber', 'electrician', 'carpenter', 'painter', 'gardener', 'others']
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{12}$/
    }
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
