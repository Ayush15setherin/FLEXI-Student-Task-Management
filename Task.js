const { Schema, model } = require("mongoose");

module.exports = model("Task", new Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subject:     { type: String, required: true, trim: true },
  priority:    { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status:      { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  dueDate:     { type: Date, required: true },
  student:     { type: Schema.Types.ObjectId, ref: "Student", required: true },
}, { timestamps: true }));
