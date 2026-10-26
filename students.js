const router = require("express").Router();
const Student = require("../models/Student");
const Task = require("../models/Task");
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", wrap(async (_req, res) => res.json(await Student.find().sort({ name: 1 }))));

router.post("/", wrap(async (req, res) => res.status(201).json(await Student.create(req.body))));

router.put("/:id", wrap(async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!s) return res.status(404).json({ message: "Student not found." });
  res.json(s);
}));

router.delete("/:id", wrap(async (req, res) => {
  await Task.deleteMany({ student: req.params.id });
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student and their tasks deleted." });
}));

module.exports = router;
