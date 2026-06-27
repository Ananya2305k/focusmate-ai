const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  time: String,
  task: String,
  completed: { type: Boolean, default: false },
});

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },
    mood: { type: String, enum: ["great", "good", "okay", "low", "bad"], default: "good" },
    tasks: [taskSchema],
    aiReflection: { type: String, default: "" },
    reflectionGenerated: { type: Boolean, default: false },
    completedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
