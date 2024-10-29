const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

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

app.post("/workers", async (req, res) => {
    try {
        const worker = new Worker({
            name: req.body.name,
            phone: req.body.phone,
            experience: req.body.experience,
            wages: req.body.wages,
            address1: req.body.address1,
            pincode: req.body.pincode,
            city: req.body.city,
            workType: req.body.workType,
            aadharNumber: req.body.aadharNumber    
        });
        await worker.save();
        res.status(201).sendFile(path.join(__dirname, "../public", "login.html")); 
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/customers", async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name || !req.body.phone || !req.body.address) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const customer = new Customer({
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address
        });
        
        const savedCustomer = await customer.save();
        res.status(201).sendFile(path.join(__dirname, "../public", "login.html"));
    } catch (error) {
        // Check for specific MongoDB errors
        if (error.code === 11000) {
            res.status(400).send({ error: "Phone number already exists" });
        } else {
            console.error("Customer save error:", error);
            res.status(400).send({ error: error.message });
        }
    }
});

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});