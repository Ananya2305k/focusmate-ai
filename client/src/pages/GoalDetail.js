import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const MOOD_EMOJI = { great: "😄", good: "🙂", okay: "😐", low: "😔", bad: "😞" };

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/goals`).then(({ data }) => {
      const found = data.find((g) => g._id === id);
      if (found) setGoal(found);
      else navigate("/");
    });
  }, [id, navigate]);

  const toggleTask = async (taskId) => {
    try {
      const { data } = await axios.patch(`/api/goals/${id}/task/${taskId}`);
      setGoal(data);
    } catch { toast.error("Failed to update task"); }
  };

  const generateReflection = async () => {
    setReflectionLoading(true);
    try {
      const { data } = await axios.post("/api/ai/daily-reflection", {
        goal: goal.title,
        tasks: goal.tasks,
        mood: goal.mood,
        completedCount: goal.completedCount,
        totalCount: goal.tasks.length,
      });
      const { data: updated } = await axios.patch(`/api/goals/${id}/reflection`, {
        reflection: data.reflection,
      });
      setGoal(updated);
      toast.success("AI reflection generated! ✨");
    } catch { toast.error("Failed to generate reflection"); }
    finally { setReflectionLoading(false); }
  };

  if (!goal) return <div className="loading">Loading goal...</div>;

  const total = goal.tasks.length;
  const done = goal.completedCount || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="goal-detail">
      <nav className="navbar">
        <div className="navbar-brand"><span>🎯 FocusMate AI</span></div>
      </nav>
      <div className="detail-content">
        <button className="back-btn" onClick={() => navigate("/")}>← Back to Dashboard</button>

        <div className="detail-header">
          <div className="detail-title">{goal.title}</div>
          <div className="detail-meta">
            <span className={`mood-badge mood-${goal.mood}`}>{MOOD_EMOJI[goal.mood]} {goal.mood}</span>
            <span className="detail-date">{goal.date}</span>
            <span className="detail-date">{done}/{total} tasks completed</span>
          </div>
          {goal.description && (
            <p style={{ marginTop: 12, color: "#666", fontSize: 14, lineHeight: 1.6 }}>{goal.description}</p>
          )}
          <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-text" style={{ marginTop: 6 }}>{pct}% complete</div>
        </div>

        <div className="tasks-section">
          <h3>📋 Today's Tasks</h3>
          {goal.tasks.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 14 }}>No tasks generated.</p>
          ) : (
            goal.tasks.map((task) => (
              <div key={task._id} className="task-item" onClick={() => toggleTask(task._id)}>
                <div className={`task-checkbox ${task.completed ? "done" : ""}`}>
                  {task.completed && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
                </div>
                <span className="task-time">{task.time}</span>
                <span className={`task-text ${task.completed ? "done" : ""}`}>{task.task}</span>
              </div>
            ))
          )}
        </div>

        <div className="reflection-section">
          <h3>🌙 AI End-of-Day Reflection</h3>
          {goal.reflectionGenerated ? (
            <div className="reflection-text">{goal.aiReflection}</div>
          ) : (
            <>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
                Done for the day? Let AI give you a personalized reflection on your progress.
              </p>
              <button className="btn-generate-reflection" onClick={generateReflection} disabled={reflectionLoading}>
                {reflectionLoading ? "Generating reflection..." : "✨ Generate My Reflection"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
