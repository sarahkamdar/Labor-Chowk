const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        minlength: [5, "Address must be at least 5 characters long"],
        maxlength: [500, "Address cannot exceed 500 characters"] // Added max length
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(value) {
                return value === this.password;
            },
            message: "Passwords do not match"
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to hash password before saving the customer
customerSchema.pre("save", async function (next) {
    try {
        // Only hash the password if it has been modified (or is new)
        if (!this.isModified("password")) return next();

        // Generate a salt and hash the password
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware to handle MongoDB validation errors
customerSchema.post("save", (error, doc, next) => {
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Phone number already exists. Please use a different phone number."));
    } else if (error.name === "ValidationError") {
        const errorMessages = Object.values(error.errors)
            .map((err) => err.message)
            .join(", ");
        next(new Error(`Validation error: ${errorMessages}`));
    } else {
        next(error);
    }
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;