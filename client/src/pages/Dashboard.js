import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const MOODS = ["great", "good", "okay", "low", "bad"];
const MOOD_EMOJI = { great: "😄", good: "🙂", okay: "😐", low: "😔", bad: "😞" };

function formatDate(d) {
  return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [goals, setGoals] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", mood: "good", availableHours: "9am to 9pm" });

  const fetchGoals = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/goals/date/${toDateStr(currentDate)}`);
      setGoals(data);
    } catch { toast.error("Failed to load goals"); }
  }, [currentDate]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Goal title is required");
    setAiLoading(true);
    try {
      const { data: aiData } = await axios.post("/api/ai/generate-tasks", {
        goal: form.title, description: form.description, availableHours: form.availableHours,
      });
      await axios.post("/api/goals", {
        title: form.title, description: form.description,
        date: toDateStr(currentDate), mood: form.mood, tasks: aiData.tasks,
      });
      toast.success("Goal created with AI tasks! 🎯");
      setShowModal(false);
      setForm({ title: "", description: "", mood: "good", availableHours: "9am to 9pm" });
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create goal");
    } finally { setAiLoading(false); }
  };

  const changeDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>🎯 FocusMate AI</span>
        </div>
        <div className="navbar-right">
          <span className="welcome-text">Hey, {user?.name?.split(" ")[0]}!</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="date-nav">
            <button onClick={() => changeDate(-1)}>‹</button>
            <span>{formatDate(currentDate)}</span>
            <button onClick={() => changeDate(1)}>›</button>
          </div>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            + Add Goal
          </button>
        </div>

        <div className="goals-grid">
          {goals.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🌅</div>
              <p>No goals for this day yet.<br />Add one and let AI plan your day!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const total = goal.tasks.length;
              const done = goal.completedCount || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Link to={`/goal/${goal._id}`} key={goal._id} className="goal-card">
                  <div className="goal-card-header">
                    <div className="goal-title">{goal.title}</div>
                    <span className={`mood-badge mood-${goal.mood}`}>
                      {MOOD_EMOJI[goal.mood]} {goal.mood}
                    </span>
                  </div>
                  {goal.description && <div className="goal-desc">{goal.description}</div>}
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="progress-text">{done}/{total} tasks · {pct}% done</div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>🎯 New Goal for Today</h3>
            <div className="form-group">
              <label>Goal Title *</label>
              <input placeholder="e.g. Complete DSA revision chapter 5"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea rows={3} placeholder="Any extra context for AI..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>How are you feeling today?</label>
              <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
                {MOODS.map((m) => <option key={m} value={m}>{MOOD_EMOJI[m]} {m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Available hours</label>
              <input placeholder="9am to 9pm" value={form.availableHours}
                onChange={(e) => setForm({ ...form, availableHours: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-ai" onClick={handleCreate} disabled={aiLoading}>
                {aiLoading ? "AI is planning..." : "✨ Create with AI"}
              </button>
            </div>
            <p className="ai-info">AI will automatically break your goal into hourly tasks</p>
          </div>
        </div>
      )}
    </div>
  );
}
