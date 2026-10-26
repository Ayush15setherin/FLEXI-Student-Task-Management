const router = require("express").Router();
const Task = require("../models/Task");
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", wrap(async (req, res) => {
  const { status, priority, student, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (student) filter.student = student;
  if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  res.json(await Task.find(filter).populate("student", "name rollNo").sort({ dueDate: 1 }));
}));

router.get("/stats", wrap(async (_req, res) => {
  const [total, completed, inProgress, pending, overdue] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: "Completed" }),
    Task.countDocuments({ status: "In Progress" }),
    Task.countDocuments({ status: "Pending" }),
    Task.countDocuments({ status: { $ne: "Completed" }, dueDate: { $lt: new Date() } }),
  ]);
  res.json({ total, completed, inProgress, pending, overdue });
}));

router.post("/", wrap(async (req, res) => res.status(201).json(await Task.create(req.body))));

router.put("/:id", wrap(async (req, res) => {
  const t = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!t) return res.status(404).json({ message: "Task not found." });
  res.json(t);
}));

router.delete("/:id", wrap(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted." });
}));

module.exports = router;
