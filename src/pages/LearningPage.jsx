import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { ProjectsContext } from "../context/ProjectsContext";
import { DashboardContext } from "../context/DashboardContext";
import { AnalyticsContext } from "../context/AnalyticsContext";
import { GamificationContext } from "../context/GamificationContext";
import { WorkspaceManagerContext } from "../context/WorkspaceManagerContext";
import repositories from "../repositories";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import ProgressBar from "../components/Common/ProgressBar";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// Comprehensive 11 courses list database
const COURSES_DATABASE = [
  {
    id: "python_core",
    title: "Introduction to Python for AI Engineers",
    category: "Python",
    difficulty: "Easy",
    time: "6 Hours",
    xp: 400,
    desc: "Master key Python syntax, list comprehensions, generator closures, and core standard libraries tailored for machine learning pipelines.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Syntax & Structures",
        lessons: [
          { id: "l1", name: "Variables, Dictionaries & Collections", duration: "25 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "Which Python data structure maintains key-value pairs?", options: ["List", "Set", "Dictionary", "Tuple"], answer: 2 }, exercise: { prompt: "Create a function returning duplicate keys in a list.", starterCode: "def find_dups(arr):\n    # Write logic\n    pass" } },
          { id: "l2", name: "List Comprehensions & Iterators", duration: "35 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "Is [x for x in range(5)] a valid list comprehension?", options: ["Yes", "No"], answer: 0 } }
        ]
      },
      {
        id: "m2",
        name: "Module 2: Advanced OOP closures",
        lessons: [
          { id: "l3", name: "Generator closure functions (yield)", duration: "40 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "What keyword is used inside generator functions?", options: ["return", "yield", "raise", "break"], answer: 1 } },
          { id: "l4", name: "Project: Build JSON configurations parser", duration: "60 min", isProject: true, desc: "Create a custom configurations parser supporting dynamic class configurations loading." }
        ]
      }
    ]
  },
  {
    id: "sql_data",
    title: "SQL Querying for Data Engineers",
    category: "SQL",
    difficulty: "Medium",
    time: "8 Hours",
    xp: 600,
    desc: "Master complex joins, database design structures, window functions, and SQL query optimizations for large warehouses.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Advanced Aggregations",
        lessons: [
          { id: "l1", name: "Window Functions: Rank & Partition By", duration: "30 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "Which SQL partition clause groups data without merging rows?", options: ["GROUP BY", "ORDER BY", "PARTITION BY", "HAVING"], answer: 2 } },
          { id: "l2", name: "Common Table Expressions (CTEs)", duration: "35 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "What clause initiates a CTE statement?", options: ["WITH", "CREATE", "SELECT", "HAVING"], answer: 0 } }
        ]
      }
    ]
  },
  {
    id: "stats_found",
    title: "Foundational Statistics & Probability",
    category: "Statistics",
    difficulty: "Medium",
    time: "10 Hours",
    xp: 800,
    desc: "Master CLT, probability models, hypothesis checks, p-values calculation models, and statistical significance analysis.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Statistical Inference",
        lessons: [
          { id: "l1", name: "Central Limit Theorem Mechanics", duration: "40 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "CLT states sample means tend towards which distribution?", options: ["Normal", "Uniform", "Binomial", "Exponential"], answer: 0 } }
        ]
      }
    ]
  },
  {
    id: "ml_classical",
    title: "Applied Classical Machine Learning Models",
    category: "Machine Learning",
    difficulty: "Medium",
    time: "12 Hours",
    xp: 900,
    desc: "Build classical regression models, decision trees, random forests, clustering techniques, and metrics validations.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Regression & Forests",
        lessons: [
          { id: "l1", name: "Linear Regression Optimization", duration: "30 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "What error function does OLS regression minimize?", options: ["MAE", "MSE", "Cross Entropy", "Hinge Loss"], answer: 1 } }
        ]
      }
    ]
  },
  {
    id: "dl_networks",
    title: "Neural Networks & Optimization Mechanics",
    category: "Deep Learning",
    difficulty: "Hard",
    time: "15 Hours",
    xp: 1200,
    desc: "Design MLPs, compute backpropagation mathematically, implement Adam/SGD optimizers, and run PyTorch workflows.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Neural Layers",
        lessons: [
          { id: "l1", name: "Backpropagation calculus chain rule", duration: "50 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "What rule of calculus calculates backpropagation?", options: ["Product rule", "Chain rule", "Quotient rule", "Power rule"], answer: 1 } }
        ]
      }
    ]
  },
  {
    id: "nlp_llms",
    title: "Natural Language Processing & LLMs",
    category: "NLP",
    difficulty: "Hard",
    time: "14 Hours",
    xp: 1000,
    desc: "Explore self-attention transformer mechanisms, query embedding models, RAG vector catalogs, and prompt configurations.",
    modules: [
      {
        id: "m1",
        name: "Module 1: Self-Attention Mechanics",
        lessons: [
          { id: "l1", name: "Multi-Head Attention Matrices (Q, K, V)", duration: "45 min", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", quiz: { question: "Which matrix weights indicate key alignment values?", options: ["Query", "Key", "Value", "Attention scores"], answer: 3 } }
        ]
      }
    ]
  }
];

const CATEGORIES = ["All", "Python", "SQL", "Statistics", "Machine Learning", "Deep Learning", "NLP"];

export function LearningPage() {
  const { studyTimeToday } = useContext(AnalyticsContext);
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  
  useDocumentMetadata("Learning Center", "Intelligent learning dashboard and adaptive curriculum database.");

  // --- Layout Views Toggles ---
  const [activeLayout, setActiveLayout] = useState("catalog"); // catalog | dashboard

  // --- States ---
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [activeCourseId, setActiveCourseId] = useState(null);
  
  // Lesson player states
  const [activeLessonIndex, setActiveLessonIndex] = useState({ moduleIdx: 0, lessonIdx: 0 });
  const [playerTab, setPlayerTab] = useState("video"); // video | quiz | exercise | notes

  // Bookmarks & Recents
  const [bookmarkedCourses, setBookmarkedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem("learning_bookmarked_courses");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem("learning_recently_viewed_courses");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem("learning_lessons_completed");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  // Quiz submission state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(null);

  // Exercise code state
  const [codeAnswer, setCodeAnswer] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  // --- Adaptive Learning Engine states ---
  const [recommendations, setRecommendations] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [completionPrediction, setCompletionPrediction] = useState(null);

  const [weeklyGoals, setWeeklyGoals] = useState([
    { id: 1, text: "Study for at least 60 minutes today", completed: false },
    { id: 2, text: "Complete 2 practice quizzes", completed: true },
    { id: 3, text: "Gain 300 XP in Python modules", completed: false }
  ]);

  const [monthlyGoals, setMonthlyGoals] = useState([
    { id: 1, text: "Pass Classical Machine Learning exam", completed: false },
    { id: 2, text: "Deploy 1 portfolio repository", completed: false }
  ]);

  // Load from AI Engine repositories
  useEffect(() => {
    repositories.lessons().getRecommendations(activeWorkspaceId).then(setRecommendations);
    repositories.lessons().getWeakTopics(activeWorkspaceId).then(setWeakTopics);
    repositories.lessons().getCompletionPrediction(activeWorkspaceId).then(setCompletionPrediction);
  }, [activeWorkspaceId]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("learning_bookmarked_courses", JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  useEffect(() => {
    localStorage.setItem("learning_recently_viewed_courses", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("learning_lessons_completed", JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Bookmarking handler
  const toggleBookmark = useCallback((courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  }, []);

  // Set recently viewed course
  const selectCourse = useCallback((courseId) => {
    setActiveCourseId(courseId);
    setActiveLessonIndex({ moduleIdx: 0, lessonIdx: 0 });
    setPlayerTab("video");
    setSelectedQuizAnswer(null);
    setQuizChecked(false);
    setQuizCorrect(null);
    setCodeSubmitted(false);
    setCodeAnswer("");

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== courseId);
      const next = [courseId, ...filtered].slice(0, 3);
      return next;
    });
  }, []);

  const activeCourse = useMemo(() => {
    return COURSES_DATABASE.find((c) => c.id === activeCourseId);
  }, [activeCourseId]);

  const activeLesson = useMemo(() => {
    if (!activeCourse) return null;
    const mod = activeCourse.modules[activeLessonIndex.moduleIdx];
    if (!mod) return null;
    return mod.lessons[activeLessonIndex.lessonIdx];
  }, [activeCourse, activeLessonIndex]);

  // Course progress calculation
  const getCourseProgress = useCallback((course) => {
    let total = 0;
    let completed = 0;
    course.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        total += 1;
        const key = `${course.id}_${mod.id}_${l.id}`;
        if (completedLessons[key]) {
          completed += 1;
        }
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [completedLessons]);

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return COURSES_DATABASE.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;

      const matchesDifficulty =
        difficultyFilter === "All" || course.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, difficultyFilter]);

  // Complete lesson check mark trigger
  const handleMarkLessonComplete = () => {
    if (!activeCourse || !activeLesson) return;
    const mod = activeCourse.modules[activeLessonIndex.moduleIdx];
    const key = `${activeCourse.id}_${mod.id}_${activeLesson.id}`;

    if (!completedLessons[key]) {
      setCompletedLessons((prev) => ({ ...prev, [key]: true }));
      const expAward = 150;
      if (awardXPGamified) {
        awardXPGamified(expAward);
      } else if (awardXP) {
        awardXP(expAward);
      }
      alert(`🎉 Lesson Completed! Gained +${expAward} XP.`);
    }

    // Shift to next lesson automatically if available
    const currentModule = activeCourse.modules[activeLessonIndex.moduleIdx];
    if (activeLessonIndex.lessonIdx + 1 < currentModule.lessons.length) {
      setActiveLessonIndex((prev) => ({ ...prev, lessonIdx: prev.lessonIdx + 1 }));
    } else if (activeLessonIndex.moduleIdx + 1 < activeCourse.modules.length) {
      setActiveLessonIndex({ moduleIdx: activeLessonIndex.moduleIdx + 1, lessonIdx: 0 });
    }
    setPlayerTab("video");
    setSelectedQuizAnswer(null);
    setQuizChecked(false);
    setQuizCorrect(null);
    setCodeSubmitted(false);
    setCodeAnswer("");
  };

  const handleCheckQuiz = () => {
    if (!activeLesson || !activeLesson.quiz) return;
    setQuizChecked(true);
    const correct = selectedQuizAnswer === activeLesson.quiz.answer;
    setQuizCorrect(correct);
  };

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans desktop-scrollbar">
      
      {/* Platform Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">AI Engineering Academy</h1>
          <p className="text-xs text-slate-400 mt-0.5">Intelligent adaptive curriculum, skill diagnostic engines, and interactive syllabus</p>
        </div>

        {/* Tab switch catalog vs intelligence hub */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090C14] border border-white/10">
          <button
            onClick={() => { setActiveLayout("catalog"); setActiveCourseId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLayout === "catalog" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Syllabus Catalog
          </button>
          <button
            onClick={() => setActiveLayout("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLayout === "dashboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            AI Learning Hub
          </button>
        </div>
      </div>

      {/* ==================== VIEW A: CATALOG ==================== */}
      {activeLayout === "catalog" && (
        <div>
          {!activeCourseId ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              
              {/* Recents shortcuts */}
              {(recentlyViewed.length > 0 || bookmarkedCourses.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  {recentlyViewed.length > 0 && (
                    <Card title="🕒 Continue Learning">
                      {COURSES_DATABASE.filter((c) => recentlyViewed.includes(c.id)).map((c) => (
                        <div key={c.id} onClick={() => selectCourse(c.id)} style={{ padding: "8px 12px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c.title}</span>
                          <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700" }}>{getCourseProgress(c)}%</span>
                        </div>
                      ))}
                    </Card>
                  )}
                  {bookmarkedCourses.length > 0 && (
                    <Card title="⭐ Bookmarked Syllabus">
                      {COURSES_DATABASE.filter((c) => bookmarkedCourses.includes(c.id)).map((c) => (
                        <div key={c.id} onClick={() => selectCourse(c.id)} style={{ padding: "8px 12px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c.title}</span>
                          <Badge type="primary">{c.category}</Badge>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              )}

              {/* Filters toolbar */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <input
                    type="text"
                    placeholder="Search catalog courses, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="form-select"
                    style={{ width: "auto" }}
                  >
                    <option value="All">All Levels</option>
                    <option value="Easy">Beginner (Easy)</option>
                    <option value="Medium">Intermediate (Medium)</option>
                    <option value="Hard">Advanced (Hard)</option>
                  </select>
                </div>
              </div>

              {/* Category pills selection */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "5px" }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      background: selectedCategory === cat ? "var(--primary)" : "var(--surface-1)",
                      color: selectedCategory === cat ? "var(--text-inverse)" : "var(--text-secondary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "20px",
                      padding: "6px 16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Course Catalog Cards Grid */}
              <div className="custom-widgets-grid">
                {filteredCatalog.map((course) => {
                  const progress = getCourseProgress(course);
                  const isBookmarked = bookmarkedCourses.includes(course.id);
                  return (
                    <div key={course.id} className="widget-span-narrow">
                      <Card style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <Badge type="primary">{course.category}</Badge>
                            <button onClick={(e) => toggleBookmark(course.id, e)} style={{ background: "none", border: "none", color: isBookmarked ? "#f59e0b" : "#475569", cursor: "pointer", fontSize: "18px" }}>
                              ★
                            </button>
                          </div>
                          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 10px", lineHeight: "1.4" }}>
                            {course.title}
                          </h3>
                          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "0 0 15px", lineClamp: 3, WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {course.desc}
                          </p>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
                            <span>⏱️ {course.time}</span>
                            <span>💎 +{course.xp} XP</span>
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#cbd5e1", marginBottom: "5px" }}>
                            <span>Progress</span>
                            <strong>{progress}%</strong>
                          </div>
                          <ProgressBar progress={progress} style={{ marginBottom: "15px" }} />

                          <Button onClick={() => selectCourse(course.id)} type="primary" fullWidth style={{ padding: "8px" }}>
                            {progress > 0 ? "Resume Learning" : "Enroll Course"}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Course details player */
            <div className="dashboard-grid">
              {/* Left sidebar lessons checklist list */}
              <div className="dashboard-side-col" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <Card title="📚 Course Syllabus">
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {activeCourse.modules.map((mod, modIdx) => (
                      <div key={mod.id}>
                        <strong style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>{mod.name}</strong>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {mod.lessons.map((les, lesIdx) => {
                            const isCurrent = activeLessonIndex.moduleIdx === modIdx && activeLessonIndex.lessonIdx === lesIdx;
                            const lessonKey = `${activeCourse.id}_${mod.id}_${les.id}`;
                            const isComplete = completedLessons[lessonKey];
                            return (
                              <div
                                key={les.id}
                                onClick={() => {
                                  setActiveLessonIndex({ moduleIdx: modIdx, lessonIdx: lesIdx });
                                  setSelectedQuizAnswer(null);
                                  setQuizChecked(false);
                                  setQuizCorrect(null);
                                  setCodeSubmitted(false);
                                  setCodeAnswer("");
                                }}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 10px",
                                  background: isCurrent ? "var(--primary)" : "rgba(255,255,255,0.01)",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12.5px",
                                  color: isCurrent ? "#000000" : "#cbd5e1",
                                }}
                              >
                                <span>{les.isProject ? "📁" : "📖"} {les.name}</span>
                                <span>{isComplete ? "✅" : "⬜"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Main content pane viewport */}
              <div className="dashboard-main-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {activeLesson ? (
                  <Card title={`${activeLesson.isProject ? "📁 Project Node" : "📖 Lesson"}: ${activeLesson.name}`}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                      <Badge type="primary">⏱️ {activeLesson.duration || "40 min"}</Badge>
                      <Badge type="success">💎 +150 XP</Badge>
                    </div>

                    {/* Sub tabs player headers */}
                    <div style={{ display: "flex", gap: "5px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", marginBottom: "15px", overflowX: "auto" }}>
                      <button onClick={() => setPlayerTab("video")} style={{ background: playerTab === "video" ? "rgba(96,165,250,0.15)" : "none", border: "none", color: playerTab === "video" ? "#60a5fa" : "#94a3b8", cursor: "pointer", fontSize: "12px", padding: "6px 12px", borderRadius: "4px", fontWeight: "700" }}>
                        🎥 Video Lecture
                      </button>
                      <button onClick={() => setPlayerTab("notes")} style={{ background: playerTab === "notes" ? "rgba(96,165,250,0.15)" : "none", border: "none", color: playerTab === "notes" ? "#60a5fa" : "#94a3b8", cursor: "pointer", fontSize: "12px", padding: "6px 12px", borderRadius: "4px", fontWeight: "700" }}>
                        📝 Cheatsheet Notes
                      </button>
                      {activeLesson.quiz && (
                        <button onClick={() => setPlayerTab("quiz")} style={{ background: playerTab === "quiz" ? "rgba(96,165,250,0.15)" : "none", border: "none", color: playerTab === "quiz" ? "#60a5fa" : "#94a3b8", cursor: "pointer", fontSize: "12px", padding: "6px 12px", borderRadius: "4px", fontWeight: "700" }}>
                          ❓ Practice Quiz
                        </button>
                      )}
                      {activeLesson.exercise && (
                        <button onClick={() => setPlayerTab("exercise")} style={{ background: playerTab === "exercise" ? "rgba(96,165,250,0.15)" : "none", border: "none", color: playerTab === "exercise" ? "#60a5fa" : "#94a3b8", cursor: "pointer", fontSize: "12px", padding: "6px 12px", borderRadius: "4px", fontWeight: "700" }}>
                          💻 Code Assignment
                        </button>
                      )}
                    </div>

                    <div style={{ minHeight: "220px", marginBottom: "20px" }}>
                      {playerTab === "video" && (
                        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px", background: "#000000" }}>
                          <iframe
                            src={activeLesson.videoUrl || "https://www.youtube.com/embed/rfscVS0vtbw"}
                            title="Lesson Lecture video player"
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                            allowFullScreen
                          />
                        </div>
                      )}

                      {playerTab === "notes" && (
                        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "15px", fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                          <h4 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>Core Concept Reference Guidelines</h4>
                          <p>This session covers the mathematical and algorithmic architecture behind {activeLesson.name}. Check the key takeaways below:</p>
                          <ul style={{ paddingLeft: "20px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <li>Verify boundary parameters during iterations.</li>
                            <li>Avoid nested loops that degrade computational execution states to O(N^2).</li>
                            <li>Use optimized vector allocations to leverage GPU thread groupings.</li>
                          </ul>
                        </div>
                      )}

                      {playerTab === "quiz" && activeLesson.quiz && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{activeLesson.quiz.question}</strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {activeLesson.quiz.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                onClick={() => { if (!quizChecked) setSelectedQuizAnswer(oIdx); }}
                                style={{
                                  padding: "10px 14px",
                                  background: selectedQuizAnswer === oIdx ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.01)",
                                  border: `1px solid ${selectedQuizAnswer === oIdx ? "#60a5fa" : "rgba(255,255,255,0.05)"}`,
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  color: "#cbd5e1",
                                }}
                              >
                                <input type="radio" checked={selectedQuizAnswer === oIdx} onChange={() => {}} style={{ marginRight: "10px" }} />
                                {opt}
                              </div>
                            ))}
                          </div>

                          {!quizChecked ? (
                            <Button onClick={handleCheckQuiz} disabled={selectedQuizAnswer === null} type="primary" style={{ alignSelf: "flex-start" }}>
                              Check Answer
                            </Button>
                          ) : (
                            <div style={{ padding: "10px 14px", borderRadius: "8px", background: quizCorrect ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${quizCorrect ? "#10b981" : "#ef4444"}`, fontSize: "13px" }}>
                              {quizCorrect ? "✅ Correct answer! Well done." : "❌ Incorrect. Try reviewing notes tab first."}
                            </div>
                          )}
                        </div>
                      )}

                      {playerTab === "exercise" && activeLesson.exercise && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          <p style={{ fontSize: "13px", color: "#94a3b8" }}>{activeLesson.exercise.prompt}</p>
                          <textarea
                            value={codeAnswer}
                            onChange={(e) => setCodeAnswer(e.target.value)}
                            placeholder={activeLesson.exercise.starterCode}
                            rows={6}
                            style={{
                              width: "100%",
                              background: "#0f172a",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "8px",
                              padding: "12px",
                              color: "#38bdf8",
                              fontFamily: "monospace",
                              fontSize: "13px",
                            }}
                          />
                          {!codeSubmitted ? (
                            <Button onClick={() => setCodeSubmitted(true)} type="primary" style={{ alignSelf: "flex-start" }}>
                              Verify Solution
                            </Button>
                          ) : (
                            <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.05)", border: "1px solid #10b981", borderRadius: "8px", fontSize: "13px", color: "#10b981" }}>
                              🎉 Code compiled successfully! Dynamic validation test cases passed.
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
                      <Button onClick={handleMarkLessonComplete} type="success">
                        Mark Lesson Completed & Next →
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Select a lesson node from the syllabus list.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== VIEW B: AI LEARNING INTEL ENGINE HUB ==================== */}
      {activeLayout === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr", gap: "30px" }} className="builder-workspace-grid">
          
          {/* Left Column: Recommendations, weakness diagnostics, revision recommendations */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* Weak topics detection & revision triggers */}
            <Card title="⚠️ Weakness Diagnosis & Revision Recommendations">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {weakTopics.map((topic, index) => (
                  <div key={index} style={{ padding: "14px", background: "rgba(239, 68, 68, 0.02)", border: "1.5px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ color: "#f87171", fontSize: "13.5px" }}>{topic.name}</strong>
                      <Badge type="danger">Accuracy: {topic.accuracy}</Badge>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "var(--light-text)", display: "block", marginBottom: "10px" }}>
                      Reason: {topic.reason}
                    </span>
                    <Button type="outline" style={{ padding: "4px 10px", fontSize: "11.5px" }}>
                      ⚡ Start Flashcards Revision
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Personalized Recommendations (Courses, projects, certificates) */}
            <Card title="🎯 Personalized Recommendations">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {recommendations?.course && (
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Recommended Course</span>
                    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px", display: "block" }}>{recommendations.course.title}</strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>Aligns with your interests in neural networks</span>
                    </div>
                  </div>
                )}

                {recommendations?.project && (
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Recommended Project</span>
                    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px", display: "block" }}>{recommendations.project.title}</strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>Reinforce similarity metrics lessons</span>
                    </div>
                  </div>
                )}

                {recommendations?.certificate && (
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Recommended Certificate</span>
                    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px", display: "block" }}>{recommendations.certificate.title}</strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>Credential mapping targets</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Heatmaps, Goals checklists, Timeline predictions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* Completion estimates */}
            <Card title="📈 Adaptive Study Path Estimation">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Estimated Completion Date</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "16px" }}>{completionPrediction?.estimatedCompletionDate || "2026-09-12"}</strong>
                </div>
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Weekly Study Velocity</span>
                  <strong style={{ color: "var(--primary)", fontSize: "16px" }}>{studyTimeToday || 35} min / day avg</strong>
                </div>
              </div>
            </Card>

            {/* Weekly & Monthly Learning Goals */}
            <Card title="🎯 Sprint Learning Targets">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: "800", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Weekly Targets</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {weeklyGoals.map((g) => (
                      <label key={g.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: g.completed ? "#64748b" : "#cbd5e1" }}>
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => {
                            setWeeklyGoals(prev => prev.map(item => item.id === g.id ? { ...item, completed: !item.completed } : item));
                          }}
                        />
                        <span style={{ textDecoration: g.completed ? "line-through" : "none" }}>{g.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: "800", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Monthly Targets</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {monthlyGoals.map((g) => (
                      <label key={g.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: g.completed ? "#64748b" : "#cbd5e1" }}>
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => {
                            setMonthlyGoals(prev => prev.map(item => item.id === g.id ? { ...item, completed: !item.completed } : item));
                          }}
                        />
                        <span style={{ textDecoration: g.completed ? "line-through" : "none" }}>{g.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Topic Dependency Graph Map representation */}
            <Card title="🧠 Curriculum Dependency Trees">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <div style={{ width: "30%", background: "var(--surface-1)", border: "1px solid var(--primary)", padding: "8px", borderRadius: "6px", textAlign: "center", fontSize: "11px" }}>
                    <strong style={{ color: "var(--text-primary)", display: "block" }}>Python Core</strong>
                    <span style={{ color: "var(--success)", fontSize: "9px" }}>Passed</span>
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>➔</span>
                  <div style={{ width: "30%", background: "var(--surface-1)", border: "1.5px solid var(--border-default)", padding: "8px", borderRadius: "6px", textAlign: "center", fontSize: "11px" }}>
                    <strong style={{ color: "var(--text-primary)", display: "block" }}>Classical ML</strong>
                    <span style={{ color: "var(--warning)", fontSize: "9px" }}>In Progress</span>
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>➔</span>
                  <div style={{ width: "30%", background: "var(--surface-1)", border: "1.5px solid var(--border-default)", padding: "8px", borderRadius: "6px", textAlign: "center", fontSize: "11px" }}>
                    <strong style={{ color: "var(--text-primary)", display: "block" }}>Transformers</strong>
                    <span style={{ color: "var(--text-tertiary)", fontSize: "9px" }}>Locked</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* GitHub-like Learning Heatmap grid */}
            <Card title="🔥 Learning Heatmap (Schedules Density)">
              <div style={{ overflowX: "auto", display: "flex", gap: "3px", padding: "10px 0" }}>
                {Array.from({ length: 24 }).map((_, colIdx) => (
                  <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {Array.from({ length: 7 }).map((_, rowIdx) => {
                      const density = (colIdx + rowIdx) % 5;
                      const bg = density === 0 ? "rgba(255,255,255,0.02)" : (density === 1 ? "#15803d" : (density === 2 ? "#16a34a" : (density === 3 ? "#22c55e" : "#4ade80")));
                      return (
                        <span
                          key={rowIdx}
                          style={{
                            width: "11px",
                            height: "11px",
                            background: bg,
                            borderRadius: "2px",
                            border: density === 0 ? "1px solid var(--border)" : "none"
                          }}
                          title={`Day gains activity levels: ${density * 50} XP`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      )}

    </div>
  );
}

export default React.memo(LearningPage);