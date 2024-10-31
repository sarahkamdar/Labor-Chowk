const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

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



customerSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
            // Remove confirmPassword field before saving
            this.confirmPassword = undefined;
        } catch (error) {
            return next(error);
        }
    }
    next();
});
  
  // Password comparison method
  customerSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };
  
  // JWT token generation method
  customerSchema.methods.generateAuthToken = async function() {
    const customer = this;
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key"; // Use a hardcoded fallback if JWT_SECRET is not set
    const token = jwt.sign({ _id: customer._id.toString() }, secretKey, { expiresIn: '1h' });
    customer.tokens = customer.tokens.concat({ token });
    await customer.save();
    return token;
};


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