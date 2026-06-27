const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-tasks", auth, async (req, res) => {
  try {
    const { goal, description, availableHours } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a productivity coach. Break down this daily goal into specific hourly tasks.
Goal: "${goal}"
Description: "${description || "No description"}"
Available hours: ${availableHours || "9am to 9pm"}

Return ONLY a JSON array like this (no extra text):
[
  { "time": "9:00 AM", "task": "Task description here" },
  { "time": "10:00 AM", "task": "Task description here" }
]

Make tasks specific, realistic, and actionable. Max 8 tasks.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ message: "AI response parsing failed" });
    const tasks = JSON.parse(jsonMatch[0]);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

router.post("/daily-reflection", auth, async (req, res) => {
  try {
    const { goal, tasks, mood, completedCount, totalCount } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const completedTasks = tasks.filter((t) => t.completed).map((t) => t.task).join(", ");
    const pendingTasks = tasks.filter((t) => !t.completed).map((t) => t.task).join(", ");

    const prompt = `You are a supportive productivity coach. Write a warm, personal end-of-day reflection (3-4 sentences) for someone who:
- Had a goal: "${goal}"
- Mood today: ${mood}
- Completed ${completedCount} out of ${totalCount} tasks
- Completed tasks: ${completedTasks || "none"}
- Pending tasks: ${pendingTasks || "none"}

Be encouraging, acknowledge their effort, and give one actionable tip for tomorrow. Keep it human and personal, not robotic.`;

    const result = await model.generateContent(prompt);
    res.json({ reflection: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

module.exports = router;
