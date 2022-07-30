const express = require("express");

require("dotenv").config();

// APP CREDENTIALS
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("Volaa!! It's working! ;)");
});

// SERVER LISTEN
app.listen(port, () => {
    console.log("Server is listening 😊");
});