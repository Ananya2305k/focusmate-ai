const express = require("express");
const Goal = require("../models/Goal");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/date/:date", auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId, date: req.params.date });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, date, mood, tasks } = req.body;
    const goal = await Goal.create({ user: req.userId, title, description, date, mood, tasks: tasks || [] });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/task/:taskId", auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const task = goal.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.completed = !task.completed;
    goal.completedCount = goal.tasks.filter((t) => t.completed).length;
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/reflection", auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { aiReflection: req.body.reflection, reflectionGenerated: true },
      { new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
