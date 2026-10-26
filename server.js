require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/students", require("./routes/students"));
app.use("/api/tasks", require("./routes/tasks"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  const status = err.name === "ValidationError" || err.code === 11000 ? 400 : 500;
  const message = err.code === 11000 ? "Roll number or email already exists." : err.message;
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`FLEXI API running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
