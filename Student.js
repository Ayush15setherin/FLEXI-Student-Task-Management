const { Schema, model } = require("mongoose");

module.exports = model("Student", new Schema({
  name:   { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, unique: true, trim: true },
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:  { type: String, trim: true },
  course: { type: String, required: true, trim: true },
  year:   { type: Number, required: true, min: 1, max: 6 },
}, { timestamps: true }));
