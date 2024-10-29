const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/labor")
.then(() => {
    console.log(`connection successful`);
}).catch(() => {
    console.log(`no connection`);
})