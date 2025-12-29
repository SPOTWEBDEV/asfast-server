const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.routes");
const airtimeRoutes = require("./routes/airtime.routes");







const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/airtime", airtimeRoutes);

// Health check
app.get("/api/v1", (req, res) => {
  res.json({ status: "API running 🚀" });
});

module.exports = app;
