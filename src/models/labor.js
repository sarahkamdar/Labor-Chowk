const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


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
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    tokens: [{
        token: {
          type: String,
          required: true
        }
      }]

});

// Middleware to hash password before saving
workerSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
            // Remove confirmPassword field if it exists
            this.confirmPassword = undefined;
        } catch (error) {
            return next(error);
        }
    }
    next();
});
  
  // Password comparison method
  workerSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };
  
  // JWT token generation method
workerSchema.methods.generateAuthToken = async function() {
    const worker = this;
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key"; // Use a fallback secret if JWT_SECRET is not set
    const token = jwt.sign({ _id: worker._id.toString() }, secretKey, { expiresIn: '1h' });
    worker.tokens = worker.tokens.concat({ token });
    await worker.save();
    return token;
};


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