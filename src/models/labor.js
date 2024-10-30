const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
    },
    experience: {
        type: Number,
        required: [true, "Experience is required"],
        min: [0, "Experience cannot be negative"]
    },
    wages: {
        type: String,
        required: [true, "Wages are required"],
        trim: true
    },
    address1: {
        type: String,
        required: [true, "Address is required"],
        trim: true
    },
    pincode: {
        type: Number,
        required: [true, "Pincode is required"],
        match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"]
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true
    },
    workType: {
        type: String,
        required: [true, "Work type is required"],
        enum: ['plumber', 'electrician', 'carpenter', 'painter', 'gardener', 'others']
    },
    aadharNumber: {
        type: String,
        required: [true, "Aadhar number is required"],
        unique: true,
        match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add password validation middleware
workerSchema.pre('validate', function(next) {
    if (this.isModified('password') || this.isNew) {
        if (this.password !== this.confirmPassword) {
            this.invalidate('confirmPassword', 'Passwords do not match');
        }
    }
    next();
});

// Middleware to hash password before saving
workerSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        
        // Clear the confirmPassword field
        this.confirmPassword = undefined;
        next();
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
workerSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        next(new Error(`${field === 'phone' ? 'Phone number' : 'Aadhar number'} already exists`));
    } else {
        next(error);
    }
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;