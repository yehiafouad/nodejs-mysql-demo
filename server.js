const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;

// Initialize .env file
dotenv.config();

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Routes usage
const indexRoutes = require("./src/routes/index");

app.use("/api", indexRoutes);

// Handling Errors
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  return res.status(err.statusCode).json({
    message: err.message,
    code: err.statusCode,
  });
});

// 404 Handler
app.use((req, res, next) => {
  console.info(
    `404 - NotFound - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(404).send({
    success: false,
    errors: [
      {
        message: "NotFound: there is no handler for this url",
      },
    ],
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
