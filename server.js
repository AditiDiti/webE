// server.js
// Express server to serve API and frontend

const express = require("express");
const path = require("path");
const scoreApi = require(path.join(__dirname, "api", "score"));

const app = express();
const PORT = 3001;

// API route
app.use("/api", scoreApi);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
