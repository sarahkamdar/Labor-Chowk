const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
// Import bcrypt for password hashing and comparison
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



require("./db/conn");
const Worker = require("./models/labor");
const Customer = require("./models/customer");

const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.use(express.json()); // Middleware to parse JSON data
app.use(express.urlencoded({extended:true}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "home.html"));
});

app.post("/workers", async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'phone', 'experience', 'wages', 'address1', 
            'pincode', 'city', 'workType', 'aadharNumber', 
            'password', 'confirmPassword'];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate phone number format
        if (!/^[0-9]{10}$/.test(req.body.phone)) {
            return res.status(400).json({
                error: "Please enter a valid 10-digit phone number"
            });
        }

        // Validate Aadhar number format
        if (!/^[0-9]{12}$/.test(req.body.aadharNumber)) {
            return res.status(400).json({
                error: "Please enter a valid 12-digit Aadhar number"
            });
        }

        // Validate password length
        if (req.body.password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long"
            });
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                error: "Passwords do not match"
            });
        }

        // Create new worker instance
        const worker = new Worker({
            name: req.body.name,
            phone: req.body.phone,
            experience: req.body.experience,
            wages: req.body.wages,
            address1: req.body.address1,
            pincode: req.body.pincode,
            city: req.body.city,
            workType: req.body.workType,
            aadharNumber: req.body.aadharNumber,
            password: req.body.password,
        });

        // Save worker
        await worker.save();
        res.status(201).sendFile(path.join(__dirname, "../public", "login.html")); 

    } catch (error) {
        // Handle specific error cases
        if (error.code === 11000) {
            // Determine which field caused the duplicate error
            const field = Object.keys(error.keyPattern)[0];
            const fieldName = field === 'phone' ? 'Phone number' : 'Aadhar number';
            return res.status(400).json({
                error: `${fieldName} already exists. Please use a different one.`
            });
        }

        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
            return res.status(400).json({
                error: `Validation error: ${errorMessages}`
            });
        }

        // Handle unexpected errors
        console.error("Worker registration error:", error);
        res.status(500).json({
            error: "An unexpected error occurred while registering the worker"
        });
    }
});

app.post("/customers", async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'phone', 'address', 'password', 'confirmPassword'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate phone number format
        if (!/^[0-9]{10}$/.test(req.body.phone)) {
            return res.status(400).json({
                error: "Please enter a valid 10-digit phone number"
            });
        }

        // Validate password length
        if (req.body.password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long"
            });
        }

        // Validate password match
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                error: "Passwords do not match"
            });
        }

        // Validate address length
        if (req.body.address.length > 500) {
            return res.status(400).json({
                error: "Address cannot exceed 500 characters"
            });
        }

        // Create new customer instance
        const customer = new Customer({
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            password: req.body.password,
        });
        
        // Save customer
        await customer.save();
        res.status(201).sendFile(path.join(__dirname, "../public", "login.html"));

    } catch (error) {
        // Error handling (same as before)
        if (error.code === 11000) {
            return res.status(400).json({
                error: "Phone number already exists. Please use a different phone number."
            });
        }

        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
            return res.status(400).json({
                error: `Validation error: ${errorMessages}`
            });
        }

        console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
    });
        res.status(500).json({
            error: "An unexpected error occurred while registering the customer"
        });
    }
});

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});


// Login routes
app.post('/login/customer', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // Find the customer
        const customer = await Customer.findOne({ phone });
        
        if (!customer) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, customer.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Generate token if credentials are correct
        const token = await customer.generateAuthToken();
        res.status(200).json({ token, redirectUrl: '/home' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});
  
app.post('/login/worker', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // Find the worker
        const worker = await Worker.findOne({ phone });
        
        if (!worker) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, worker.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Generate token if credentials are correct
        const token = await worker.generateAuthToken();
        res.status(200).json({ token, redirectUrl: '/home' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});