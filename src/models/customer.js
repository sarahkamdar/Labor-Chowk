const mongoose = require("mongoose");

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
        minlength: [5, "Address must be at least 5 characters long"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;