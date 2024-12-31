const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./Routes/userRoute");
const groupRoute = require('./Routes/groupRoute');
require("dotenv").config({ path: "../.env" }); 

const app = express();
require("dotenv").config();

app.use(express.json()); 

app.use(cors({
    origin: 'https://album-wall-generator.vercel.app',
    credentials: true, 
}));




app.use("/api/users", userRoute);
app.use('/api/groups', groupRoute);

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

app.get("/", function(req, res) {
    res.send("Welcome to PlaylistGenerator!!!");
});




mongoose.connect(uri, {

}).then(function() {
    console.log("MongoDB connection established" + mongoose.connection.db.databaseName);
}).catch(function(error) {
    console.log("MongoDB connection failed: " + error.message);
});


