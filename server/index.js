const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./Routes/userRoute");
const groupRoute = require('./Routes/groupRoute');
const path = require("path");
require("dotenv").config({ path: "../.env" }); 



const app = express();

app.use(express.json()); 
app.use(cors({
    origin: process.env.FRONTEND_URL, 
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

if (process.env.NODE_ENV == "production") {

    app.use(express.static("client/playlist_generator/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client/playlist_generator/build", "index.html"));
    })
}



mongoose.connect(uri, {

}).then(function() {
    console.log("MongoDB connection established" + mongoose.connection.db.databaseName);
}).catch(function(error) {
    console.log("MongoDB connection failed: " + error.message);
});


