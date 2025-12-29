const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

// Health check
app.get("/asfast.com/api", (req, res) => {
  res.json({ status: "API running 🚀" });
});

module.exports = app;
