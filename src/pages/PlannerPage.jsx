import React, { useState, useEffect } from "react";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import Input from "../components/Common/Input";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// PlannerPage.jsx — Task & Research Workspace (Version 2 Redesign)
// Pomodoro, habits, tasks, schedules, calendar.
// =======================================================

function PlannerPage() {
  const [activeTab, setActiveTab] = useState("daily");
  useDocumentMetadata("Research", "Organize study blocks, habits, and focus sessions.");

  // Pomodoro
  const [timeLeft, setTimeLeft] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      alert(isBreak ? "Break is over! Time to focus." : "Focus session completed! Take a break.");
      setIsBreak(!isBreak);
      setTimeLeft(!isBreak ? 300 : 1500);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, isBreak]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => { setTimerRunning(false); setIsBreak(false); setTimeLeft(1500); };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Habits
  const [habits, setHabits] = useState([
    { id: 1, name: "Code Python", completed: false },
    { id: 2, name: "Read Paper", completed: false },
    { id: 3, name: "Drink 2L Water", completed: false },
  ]);
  const toggleHabit = (id) => setHabits(habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)));
  const completedHabitsPercent = Math.round((habits.filter((h) => h.completed).length / habits.length) * 100);

  // Tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finish CLI Calculator logic", priority: "High", completed: false },
    { id: 2, text: "Watch tutorial on lists", priority: "Medium", completed: false },
    { id: 3, text: "Update dashboard components", priority: "Low", completed: true },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), priority: newTaskPriority, completed: false }]);
    setNewTaskText("");
  };
  const toggleTask = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  // Schedule
  const scheduleSlots = [
    { time: "09:00 – 11:00", topic: "Core Python Basics", active: true },
    { time: "11:00 – 12:00", topic: "Coffee Break & Reading", active: false },
    { time: "14:00 – 16:00", topic: "AI Algorithms & Math", active: true },
    { time: "16:00 – 18:00", topic: "Portfolio Projects", active: false },
  ];

  // Deadlines
  const deadlines = [
    { date: "Jul 20, 2026", task: "Python CLI Calculator due", daysLeft: 2 },
    { date: "Jul 23, 2026", task: "Operators Quiz Check", daysLeft: 5 },
    { date: "Jul 28, 2026", task: "Mid-curriculum assessment", daysLeft: 10 },
  ];

  // Weekly
  const weeklyDays = [
    { day: "Monday", objective: "Learn Python basic syntax and data types" },
    { day: "Tuesday", objective: "Implement variables, casting, and printing" },
    { day: "Wednesday", objective: "Learn operators and logical operations" },
    { day: "Thursday", objective: "Complete Calculator mini console app" },
    { day: "Friday", objective: "Learn conditionals and branching" },
    { day: "Saturday", objective: "Learn list mutability and indexing" },
    { day: "Sunday", objective: "Weekly review & portfolio updates" },
  ];

  // Monthly
  const renderMonthlyCalendar = () => {
    const daysInMonth = 31;
    const startDayOffset = 2;
    const slots = [];
    for (let i = 0; i < startDayOffset; i++) {
      slots.push(<div key={`empty-${i}`} className="p-3 bg-[#09090b] rounded-lg border border-white/[0.04]" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === 18;
      slots.push(
        <div
          key={`day-${d}`}
          className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between min-h-[60px] ${
            isToday ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200" : "bg-[#121218] border-white/[0.06] text-slate-300"
          }`}
        >
          <span className="font-bold">{d}</span>
          {d % 5 === 0 && <span className="text-[10px] text-emerald-400">Milestone</span>}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="h-full w-full bg-[#09090b] text-slate-100 p-8 overflow-y-auto font-sans v2-scrollbar">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Task & Research Planner</h1>
          <p className="text-sm text-slate-400 mt-0.5">Organize study blocks, habits, tasks, and focus sessions</p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-lg bg-[#121218] border border-white/[0.08]">
          {["daily", "weekly", "monthly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DAILY VIEW */}
      {activeTab === "daily" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Tasks & Pomodoro */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pomodoro Timer */}
            <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                  {isBreak ? "Break Session" : "Focus Session"}
                </span>
                <div className="text-4xl font-bold font-mono text-white mt-1">{formatTime(timeLeft)}</div>
              </div>

              <div className="flex gap-3">
                <Button onClick={toggleTimer} type="primary">
                  {timerRunning ? "Pause" : "Start Focus"}
                </Button>
                <Button onClick={resetTimer} type="outline">
                  Reset
                </Button>
              </div>
            </div>

            {/* Tasks Console */}
            <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Tasks</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
                </span>
              </div>

              <form onSubmit={addTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#09090b] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#09090b] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <Button type="primary">Add Task</Button>
              </form>

              <div className="space-y-2 pt-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-[#09090b] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="rounded border-white/20 bg-transparent accent-indigo-600"
                      />
                      <span className={`text-slate-200 ${task.completed ? "line-through text-slate-500" : ""}`}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge type={task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "primary"}>
                        {task.priority}
                      </Badge>
                      <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-400 text-xs">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Habits & Schedules Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Habit Tracker */}
            <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Habit Tracker</h3>
                <span className="text-xs text-emerald-400 font-mono font-semibold">{completedHabitsPercent}%</span>
              </div>

              <div className="space-y-2">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className="p-3 rounded-lg bg-[#09090b] border border-white/[0.06] flex items-center justify-between text-xs cursor-pointer hover:border-white/20 transition-all"
                  >
                    <span className={h.completed ? "line-through text-slate-500" : "text-slate-200"}>{h.name}</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${h.completed ? "bg-emerald-500 text-black font-bold" : "border border-white/20"}`}>
                      {h.completed && "✓"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Deadlines */}
            <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">Upcoming Deadlines</h3>
              <div className="space-y-2.5 text-xs">
                {deadlines.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#09090b] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{d.task}</div>
                      <div className="text-[10px] text-slate-500">{d.date}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                      {d.daysLeft}d left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeTab === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklyDays.map((w, i) => (
            <div key={i} className="p-5 rounded-xl bg-[#121218] border border-white/[0.08] space-y-2">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{w.day}</div>
              <div className="text-sm text-slate-200">{w.objective}</div>
            </div>
          ))}
        </div>
      )}

      {/* MONTHLY VIEW */}
      {activeTab === "monthly" && (
        <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
          <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">July 2026 Calendar Overview</div>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-mono text-slate-400 py-1 font-bold">
                {day}
              </div>
            ))}
            {renderMonthlyCalendar()}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(PlannerPage);
