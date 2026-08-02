import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaUsers,
  FaComments,
  FaCode,
  FaTrophy,
  FaAward,
  FaBookmark,
  FaBell,
  FaSearch,
  FaChevronRight,
  FaUserGraduate,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaPaperPlane,
  FaGithub,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaBookOpen,
  FaLock,
  FaUnlock,
  FaInfoCircle,
  FaVolumeUp,
  FaGlobe,
  FaBookmark as FaBookmarkFilled,
  FaRegBookmark,
  FaQuoteLeft,
  FaTimes,
  FaChevronUp
} from "react-icons/fa";

// Import custom common components from workspace
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import Avatar from "../components/Common/Avatar";
import Badge from "../components/Common/Badge";
import Modal from "../components/Common/Modal";

// Import mock datasets
import {
  initialDiscussions,
  initialStudyGroups,
  initialShowcaseProjects,
  initialChallenges,
  initialCompetitions,
  initialMentors,
  initialLeaderboard,
  initialNotifications
} from "../data/communityMockData";

function CommunityPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "discussions" | "study-groups" | "leaderboard" | "challenges" | "showcase" | "competitions" | "mentors" | "bookmarks" | "notifications"

  // Data states
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [studyGroups, setStudyGroups] = useState(initialStudyGroups);
  const [showcaseProjects, setShowcaseProjects] = useState(initialShowcaseProjects);
  const [challenges, setChallenges] = useState(initialChallenges);
  const [competitions, setCompetitions] = useState(initialCompetitions);
  const [mentors, setMentors] = useState(initialMentors);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter state for discussions
  const [discussionCategory, setDiscussionCategory] = useState("All");

  // Leaderboard filter
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("weekly"); // "weekly" | "monthly" | "allTime"

  // Active Discussion Details Modal / Panel
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Active Project Showcase Details Modal / Panel
  const [selectedShowcase, setSelectedShowcase] = useState(null);
  const [newProjectCommentText, setNewProjectCommentText] = useState("");

  // Booking Mentor Modal
  const [bookingMentor, setBookingMentor] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New Discussion Composer
  const [showComposer, setShowComposer] = useState(false);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerContent, setComposerContent] = useState("");
  const [composerCategory, setComposerCategory] = useState("General");
  const [composerTags, setComposerTags] = useState("");

  // New Showcase Project Composer
  const [showShowcaseComposer, setShowShowcaseComposer] = useState(false);
  const [showcaseTitle, setShowcaseTitle] = useState("");
  const [showcaseDescription, setShowcaseDescription] = useState("");
  const [showcaseTags, setShowcaseTags] = useState("");
  const [showcaseGithub, setShowcaseGithub] = useState("");
  const [showcaseLive, setShowcaseLive] = useState("");
  const [showcaseStack, setShowcaseStack] = useState("");

  // Active Study Group ID
  const [activeGroupId, setActiveGroupId] = useState(initialStudyGroups[0]?.id || "");
  const [chatMessage, setChatMessage] = useState("");

  // Active Challenge ID
  const [activeChallengeId, setActiveChallengeId] = useState(initialChallenges[0]?.id || "");
  const [challengeCode, setChallengeCode] = useState(initialChallenges[0]?.starterCode || "");
  const [consoleLogs, setConsoleLogs] = useState("Ready to run tests...");
  const [consoleIsError, setConsoleIsError] = useState(false);

  // Profile Dialog Overlay (Discord style)
  const [hoveredProfile, setHoveredProfile] = useState(null);
  const [profileModalUser, setProfileModalUser] = useState(null);

  // Simulated User Credentials (no Auth required)
  const currentUser = {
    name: "Alex Rivera",
    role: "Lead Platform Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    points: 1250,
    level: 4,
    badge: "Staff"
  };

  // Keep track of active study group object
  const activeGroup = useMemo(() => {
    return studyGroups.find((g) => g.id === activeGroupId) || studyGroups[0];
  }, [studyGroups, activeGroupId]);

  // Keep track of active coding challenge object
  const activeChallenge = useMemo(() => {
    return challenges.find((c) => c.id === activeChallengeId) || challenges[0];
  }, [challenges, activeChallengeId]);

  // Reset challenge code editor text when challenge switches
  useEffect(() => {
    if (activeChallenge) {
      setChallengeCode(activeChallenge.starterCode);
      setConsoleLogs("Ready to run tests...");
      setConsoleIsError(false);
    }
  }, [activeChallengeId]);

  // Discord automated simulated reply logic
  const chatBottomRef = useRef(null);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeGroup?.chatHistory]);

  const triggerSimulatedReply = (groupId) => {
    const replies = [
      "That makes total sense, I'll update the dependencies in the repository.",
      "Are we using LLama 3 8B or the larger 70B model for this implementation?",
      "Let's write a prompt template wrapper to defend against injection attacks.",
      "Just solved the recursive array flattener, dynamic programming really speeded things up!",
      "I can join a live Zoom call in about 20 mins if anyone wants to pair program.",
      "Has anyone benchmarked Qdrant index performance against Pinecone lately?",
      "Great work! Let's schedule a code review tonight."
    ];

    const randomUsers = [
      { name: "Dr. Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", role: "AI Research Scientist" },
      { name: "Vikram Malhotra", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80", role: "Senior AI Engineer" },
      { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", role: "NLP Specialist" }
    ];

    setTimeout(() => {
      const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      const randomMsg = replies[Math.floor(Math.random() * replies.length)];

      setStudyGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              chatHistory: [
                ...g.chatHistory,
                {
                  id: `sim-msg-${Date.now()}`,
                  author: randomUser,
                  content: randomMsg,
                  timestamp: "Just now"
                }
              ]
            };
          }
          return g;
        })
      );

      // Trigger notification log
      setNotifications((prev) => [
        {
          id: `not-sim-${Date.now()}`,
          type: "reply",
          text: `${randomUser.name} sent a message in ${gName(groupId)}`,
          time: "Just now",
          read: false
        },
        ...prev
      ]);
    }, 3000);
  };

  const gName = (id) => {
    const group = studyGroups.find((g) => g.id === id);
    return group ? group.name : "Study Group";
  };

  // Handles upvoting/downvoting
  const handleVoteDiscussion = (id, e) => {
    e.stopPropagation();
    setDiscussions((prev) =>
      prev.map((disc) => {
        if (disc.id === id) {
          const isCurrentlyLiked = disc.isLiked;
          return {
            ...disc,
            isLiked: !isCurrentlyLiked,
            upvotes: isCurrentlyLiked ? disc.upvotes - 1 : disc.upvotes + 1
          };
        }
        return disc;
      })
    );
  };

  // Handles bookmarking a post
  const handleBookmarkDiscussion = (id, e) => {
    e.stopPropagation();
    setDiscussions((prev) =>
      prev.map((disc) => {
        if (disc.id === id) {
          return {
            ...disc,
            isBookmarked: !disc.isBookmarked
          };
        }
        return disc;
      })
    );
  };

  // Upvoting show cases
  const handleVoteShowcase = (id, e) => {
    e.stopPropagation();
    setShowcaseProjects((prev) =>
      prev.map((project) => {
        if (project.id === id) {
          const liked = project.isLiked;
          return {
            ...project,
            isLiked: !liked,
            upvotes: liked ? project.upvotes - 1 : project.upvotes + 1
          };
        }
        return project;
      })
    );
  };

  // Join a study group
  const toggleJoinGroup = (groupId, e) => {
    e.stopPropagation();
    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const nextJoined = !g.joined;
          return {
            ...g,
            joined: nextJoined,
            membersCount: nextJoined ? g.membersCount + 1 : g.membersCount - 1
          };
        }
        return g;
      })
    );
  };

  // Booking simulator slots
  const handleBookSlot = () => {
    if (!selectedDay || !selectedTime) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingMentor(null);
      setSelectedDay("");
      setSelectedTime("");

      // Add notification
      setNotifications((prev) => [
        {
          id: `not-bk-${Date.now()}`,
          type: "group",
          text: `📅 Session booked successfully with ${bookingMentor.name}!`,
          time: "Just now",
          read: false
        },
        ...prev
      ]);
    }, 2000);
  };

  // Sending Discord Chat Message
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const msgObj = {
      id: `user-msg-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      content: chatMessage,
      timestamp: "Just now"
    };

    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            chatHistory: [...g.chatHistory, msgObj]
          };
        }
        return g;
      })
    );

    const targetGroupId = activeGroupId;
    setChatMessage("");

    // Simulate reply from other members in discord
    triggerSimulatedReply(targetGroupId);
  };

  // Coding Challenge submission test runner simulator
  const handleRunChallenge = (isSubmit = false) => {
    setConsoleLogs("⚙️ Compiling and executing test cases...");
    setConsoleIsError(false);

    setTimeout(() => {
      try {
        // Safe evaluation simulation
        // Create function from user code
        // We will simulate testing for cos-similarity or summarizer JSON
        let logs = "";
        let hasError = false;

        if (activeChallenge.id === "chal-1") {
          // Check if function summarizeJSON exists
          if (!challengeCode.includes("function summarizeJSON")) {
            throw new Error("ReferenceError: summarizeJSON is not defined");
          }

          logs = `✔ Test Case 1: Checking simple keys\n  Input: { status: "active" }\n  Output: { status: "active" }\n  Result: PASSED\n\n✔ Test Case 2: Deep recursion filter\n  Input: { meta: "1", data: { important: true, unused: 0 } }\n  Output: { "data.important": true }\n  Result: PASSED\n\n🎉 All tests passed successfully!`;
        } else if (activeChallenge.id === "chal-2") {
          if (!challengeCode.includes("calculateCosineSimilarity")) {
            throw new Error("ReferenceError: calculateCosineSimilarity is not defined");
          }
          logs = `✔ Test Case 1: Identical vectors\n  Input: [1,2,3], [1,2,3]\n  Expected: 1\n  Output: 1\n  Result: PASSED\n\n✔ Test Case 2: Orthogonal vectors\n  Input: [1,0], [0,1]\n  Expected: 0\n  Output: 0\n  Result: PASSED\n\n🎉 All tests passed!`;
        } else {
          logs = `✔ Test Case 1: Token bucket depletion check\n  Input: "client_1", 5, 1\n  Result: PASSED\n\n🎉 All tests passed!`;
        }

        setConsoleLogs(logs);

        if (isSubmit) {
          setConsoleLogs((prev) => `${prev}\n\n🏆 Challenge completed! +${activeChallenge.points} XP added to your profile!`);
          // Add notification
          setNotifications((prev) => [
            {
              id: `not-ch-sol-${Date.now()}`,
              type: "challenge",
              text: `🎉 You completed coding challenge: ${activeChallenge.title}! (+${activeChallenge.points} points)`,
              time: "Just now",
              read: false
            },
            ...prev
          ]);
        }
      } catch (err) {
        setConsoleIsError(true);
        setConsoleLogs(`❌ ERROR: ${err.message}\n  at Object.<anonymous> (test-cases.js:14:5)\n  at TestRunner.run (runner.js:48:19)`);
      }
    }, 1500);
  };

  // Create new Discussion Post
  const handleCreatePost = () => {
    if (!composerTitle.trim() || !composerContent.trim()) return;

    const newPost = {
      id: `disc-custom-${Date.now()}`,
      title: composerTitle,
      content: composerContent,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
        badge: currentUser.badge
      },
      category: composerCategory,
      tags: composerTags ? composerTags.split(",").map(t => t.trim()) : ["Discussion"],
      upvotes: 1,
      repliesCount: 0,
      views: 12,
      createdAt: "Just now",
      isPinned: false,
      isTrending: false,
      isLiked: true,
      isBookmarked: false,
      replies: []
    };

    setDiscussions((prev) => [newPost, ...prev]);

    // Reset fields
    setComposerTitle("");
    setComposerContent("");
    setComposerTags("");
    setShowComposer(false);

    // Swap to discussions tab to see it
    setActiveTab("discussions");
  };

  // Add Comment to selected discussion
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `rep-${selectedDiscussion.id}-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      content: newCommentText,
      createdAt: "Just now",
      likes: 0,
      isLiked: false
    };

    // Update discussions list
    setDiscussions((prev) =>
      prev.map((disc) => {
        if (disc.id === selectedDiscussion.id) {
          const updatedReplies = [...disc.replies, newComment];
          return {
            ...disc,
            repliesCount: updatedReplies.length,
            replies: updatedReplies
          };
        }
        return disc;
      })
    );

    // Update selected discussion model representation
    setSelectedDiscussion((prev) => ({
      ...prev,
      repliesCount: prev.replies.length + 1,
      replies: [...prev.replies, newComment]
    }));

    setNewCommentText("");
  };

  // Add Showcase Project
  const handleCreateShowcase = () => {
    if (!showcaseTitle.trim() || !showcaseDescription.trim()) return;

    const newProj = {
      id: `showcase-custom-${Date.now()}`,
      title: showcaseTitle,
      description: showcaseDescription,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      upvotes: 1,
      isLiked: true,
      commentsCount: 0,
      tags: showcaseTags ? showcaseTags.split(",").map(t => t.trim()) : ["AI App"],
      githubUrl: showcaseGithub,
      liveUrl: showcaseLive,
      techStack: showcaseStack ? showcaseStack.split(",").map(t => t.trim()) : ["React", "Python"],
      imageGradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
      comments: []
    };

    setShowcaseProjects((prev) => [newProj, ...prev]);

    // Clear and close
    setShowcaseTitle("");
    setShowcaseDescription("");
    setShowcaseTags("");
    setShowcaseGithub("");
    setShowcaseLive("");
    setShowcaseStack("");
    setShowShowcaseComposer(false);

    setActiveTab("showcase");
  };

  // Add comment to Showcase Project
  const handleAddShowcaseComment = () => {
    if (!newProjectCommentText.trim()) return;

    const newComment = {
      id: `c-sh-custom-${Date.now()}`,
      name: currentUser.name,
      avatar: currentUser.avatar,
      text: newProjectCommentText,
      time: "Just now"
    };

    setShowcaseProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === selectedShowcase.id) {
          const updatedComments = [...proj.comments, newComment];
          return {
            ...proj,
            commentsCount: updatedComments.length,
            comments: updatedComments
          };
        }
        return proj;
      })
    );

    setSelectedShowcase((prev) => ({
      ...prev,
      commentsCount: prev.comments.length + 1,
      comments: [...prev.comments, newComment]
    }));

    setNewProjectCommentText("");
  };

  // Filters discussions by search query & category
  const filteredDiscussions = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase();
    const safeList = Array.isArray(discussions) ? discussions : [];
    return safeList.filter((disc) => {
      if (!disc) return false;
      const title = String(disc.title || "").toLowerCase();
      const content = String(disc.content || "").toLowerCase();
      const tags = Array.isArray(disc.tags) ? disc.tags : [];
      const matchesSearch =
        !q ||
        title.includes(q) ||
        content.includes(q) ||
        tags.some((tag) => String(tag || "").toLowerCase().includes(q));

      const matchesCategory =
        discussionCategory === "All" || disc.category === discussionCategory;

      return matchesSearch && matchesCategory;
    });
  }, [discussions, searchQuery, discussionCategory]);

  // Bookmarked posts
  const bookmarkedDiscussions = useMemo(() => {
    const safeList = Array.isArray(discussions) ? discussions : [];
    return safeList.filter((disc) => disc && disc.isBookmarked);
  }, [discussions]);

  // Filter showcase projects
  const filteredShowcase = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase();
    const safeList = Array.isArray(showcaseProjects) ? showcaseProjects : [];
    return safeList.filter((proj) => {
      if (!proj) return false;
      const title = String(proj.title || "").toLowerCase();
      const desc = String(proj.description || "").toLowerCase();
      const tags = Array.isArray(proj.tags) ? proj.tags : [];
      return (
        !q ||
        title.includes(q) ||
        desc.includes(q) ||
        tags.some((t) => String(t || "").toLowerCase().includes(q))
      );
    });
  }, [showcaseProjects, searchQuery]);

  // Filter study groups
  const filteredStudyGroups = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase();
    const safeList = Array.isArray(studyGroups) ? studyGroups : [];
    return safeList.filter((g) => {
      if (!g) return false;
      const name = String(g.name || "").toLowerCase();
      const desc = String(g.description || "").toLowerCase();
      return !q || name.includes(q) || desc.includes(q);
    });
  }, [studyGroups, searchQuery]);

  // Filter mentors
  const filteredMentors = useMemo(() => {
    const q = String(searchQuery || "").toLowerCase();
    const safeList = Array.isArray(mentors) ? mentors : [];
    return safeList.filter((m) => {
      if (!m) return false;
      const name = String(m.name || "").toLowerCase();
      const skills = Array.isArray(m.skills) ? m.skills : [];
      return !q || name.includes(q) || skills.some((sk) => String(sk || "").toLowerCase().includes(q));
    });
  }, [mentors, searchQuery]);

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans desktop-scrollbar">
      {/* Header Banner */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Community Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">Connect, collaborate, and compete with AI Engineers worldwide</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setShowComposer(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95">
            <FaPlus /> Start Discussion
          </button>
          <button onClick={() => setShowShowcaseComposer(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm">
            <FaGithub /> Share Project
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090C14] border border-white/10 w-fit mb-6 overflow-x-auto">
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("dashboard"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Dashboard
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "discussions" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("discussions"); setSelectedShowcase(null); }}
        >
          Discussions
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "study-groups" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("study-groups"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Study Groups
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "challenges" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("challenges"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Challenges
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "showcase" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("showcase"); setSelectedDiscussion(null); }}
        >
          Showcase
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "competitions" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("competitions"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Hackathons
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "mentors" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("mentors"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Mentors
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "leaderboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("leaderboard"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Leaderboards
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "bookmarks" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("bookmarks"); setSelectedShowcase(null); }}
        >
          Bookmarks ({bookmarkedDiscussions.length})
        </button>
        <button
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => { setActiveTab("notifications"); setSelectedDiscussion(null); setSelectedShowcase(null); }}
        >
          Inbox {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
        </button>
      </div>

      {/* Main content body renderers */}

      {/* Tab: Dashboard */}
      {activeTab === "dashboard" && (
        <div className="community-grid-layout fade-in">
          <div className="community-main-column">
            {/* Stats Row */}
            <div className="stat-summary-row">
              <div className="community-mini-stat">
                <span className="mini-stat-icon">👥</span>
                <div className="mini-stat-info">
                  <h4>Total Members</h4>
                  <p>1,482</p>
                </div>
              </div>
              <div className="community-mini-stat">
                <span className="mini-stat-icon">💬</span>
                <div className="mini-stat-info">
                  <h4>Active Chats</h4>
                  <p>12 Online</p>
                </div>
              </div>
              <div className="community-mini-stat">
                <span className="mini-stat-icon">💻</span>
                <div className="mini-stat-info">
                  <h4>Solved Prompts</h4>
                  <p>275 Today</p>
                </div>
              </div>
              <div className="community-mini-stat">
                <span className="mini-stat-icon">🏆</span>
                <div className="mini-stat-info">
                  <h4>Hackathon Prize</h4>
                  <p>$6,500</p>
                </div>
              </div>
            </div>

            {/* Pinned & Sticky Announcements */}
            <div className="community-glass-card">
              <span className="community-section-label">📌 Pinned Announcements</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {discussions.filter(d => d.isPinned).map(pin => (
                  <div
                    key={pin.id}
                    onClick={() => { setSelectedDiscussion(pin); setActiveTab("discussions"); }}
                    style={{
                      padding: "12px 15px",
                      background: "rgba(245, 158, 11, 0.05)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0 }}>{pin.title}</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0" }}>Posted by {pin.author.name} • {pin.createdAt}</p>
                    </div>
                    <FaChevronRight style={{ color: "#fbbf24", fontSize: "12px" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Feed */}
            <div>
              <span className="community-section-label">🔥 Trending Conversations</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {discussions.filter(d => !d.isPinned).slice(0, 3).map(disc => (
                  <div
                    key={disc.id}
                    className="forum-thread-card"
                    onClick={() => { setSelectedDiscussion(disc); setActiveTab("discussions"); }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="vote-widget">
                      <button
                        className={`vote-btn ${disc.isLiked ? "upvoted" : ""}`}
                        onClick={(e) => handleVoteDiscussion(disc.id, e)}
                      >
                        <FaChevronUp />
                      </button>
                      <span className="vote-count">{disc.upvotes}</span>
                    </div>
                    <div className="thread-info">
                      <div className="thread-header-row">
                        <Avatar src={disc.author.avatar} alt={disc.author.name} size="xs" />
                        <span className="thread-author-name">{disc.author.name}</span>
                        {disc.author.badge && <span className="thread-author-badge">{disc.author.badge}</span>}
                        <span>• {disc.createdAt}</span>
                        <span className={`category-badge ${disc.category.toLowerCase()}`}>{disc.category}</span>
                      </div>
                      <h3 className="thread-title">{disc.title}</h3>
                      <p className="thread-snippet">{disc.content}</p>
                      <div className="thread-footer">
                        <div className="thread-tags-row">
                          {disc.tags.map(t => (
                            <span key={t} className="thread-tag">#{t}</span>
                          ))}
                        </div>
                        <div className="thread-meta-indicators">
                          <span className="thread-meta-indicator">💬 {disc.repliesCount} replies</span>
                          <span className="thread-meta-indicator">👁 {disc.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar components */}
          <div className="community-side-column">
            {/* Trending tags card */}
            <Card>
              <h3 style={{ color: "var(--text-primary)", fontSize: "14px", margin: "0 0 15px 0" }}>🔥 Trending Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Agentic", "LangGraph", "RAG", "Embeddings", "Ollama", "Python", "AWS"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); setActiveTab("discussions"); }}
                    style={{
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--border-default)",
                      color: "var(--primary)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>

            {/* Featured Showcase Project */}
            <Card style={{ background: "var(--surface-1)", borderColor: "var(--border-default)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="community-section-label" style={{ color: "var(--primary)", margin: 0 }}>⭐ Showcase Project</span>
                <span style={{ fontSize: "11px", color: "var(--warning)", fontWeight: 700 }}>🔥 HOT</span>
              </div>
              <h4 style={{ color: "var(--text-primary)", fontSize: "14px", margin: "0 0 6px 0" }}>Agentic DevFlow</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                An autonomous AI software agent that intercepts pull requests, reviews code and pushes tests.
              </p>
              <Button size="xs" onClick={() => { setSelectedShowcase(showcaseProjects[0]); setActiveTab("showcase"); }} type="primary">
                View Project Details
              </Button>
            </Card>

            {/* Daily Challenge card */}
            <Card style={{ background: "var(--surface-1)", borderColor: "var(--border-default)" }}>
              <span className="community-section-label" style={{ color: "var(--success)" }}>💻 Coding Challenge</span>
              <h4 style={{ color: "var(--text-primary)", fontSize: "14px", margin: "0 0 6px 0" }}>Write a Recursive JSON Summarizer</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: "0 0 12px 0" }}>Difficulty: Easy | Points: 100 XP</p>
              <Button size="xs" onClick={() => { setActiveChallengeId("chal-1"); setActiveTab("challenges"); }} type="primary">
                Open Sandbox IDE
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Discussions */}
      {activeTab === "discussions" && (
        <div className="fade-in">
          {selectedDiscussion ? (
            /* Thread details panel */
            <div className="community-glass-card fade-in">
              <Button onClick={() => setSelectedDiscussion(null)} type="outline" size="sm" style={{ marginBottom: "15px" }}>
                ← Back to Discussions
              </Button>
              <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px" }}>
                <div className="vote-widget">
                  <button
                    className={`vote-btn ${selectedDiscussion.isLiked ? "upvoted" : ""}`}
                    onClick={(e) => handleVoteDiscussion(selectedDiscussion.id, e)}
                  >
                    <FaChevronUp />
                  </button>
                  <span className="vote-count">{selectedDiscussion.upvotes}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="thread-header-row">
                    <Avatar src={selectedDiscussion.author.avatar} alt={selectedDiscussion.author.name} size="xs" />
                    <span className="thread-author-name">{selectedDiscussion.author.name}</span>
                    {selectedDiscussion.author.role && <span className="thread-author-badge">{selectedDiscussion.author.role}</span>}
                    <span>• {selectedDiscussion.createdAt}</span>
                    <span className={`category-badge ${selectedDiscussion.category.toLowerCase()}`}>{selectedDiscussion.category}</span>
                  </div>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 800, margin: "8px 0 12px 0", lineHeight: 1.4 }}>
                    {selectedDiscussion.title}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {selectedDiscussion.content}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                    <div className="thread-tags-row" style={{ margin: 0 }}>
                      {selectedDiscussion.tags.map(t => (
                        <span key={t} className="thread-tag">#{t}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => handleBookmarkDiscussion(selectedDiscussion.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        color: selectedDiscussion.isBookmarked ? "#f59e0b" : "var(--text-tertiary)",
                        cursor: "pointer",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {selectedDiscussion.isBookmarked ? <FaBookmarkFilled /> : <FaRegBookmark />}
                      <span style={{ fontSize: "12px" }}>{selectedDiscussion.isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment Thread */}
              <div className="comments-section">
                <h3 style={{ color: "var(--text-primary)", fontSize: "14px", marginBottom: "15px" }}>💬 Discussion Comments ({selectedDiscussion.repliesCount})</h3>
                <div className="comment-input-row">
                  <input
                    type="text"
                    placeholder="Write a supportive reply, share advice, or ask questions..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                  />
                  <Button onClick={handleAddComment} type="primary">Comment</Button>
                </div>

                <div className="comment-list">
                  {selectedDiscussion.replies.length > 0 ? (
                    selectedDiscussion.replies.map(rep => (
                      <div key={rep.id} className="comment-item">
                        <Avatar src={rep.author.avatar} alt={rep.author.name} size="sm" />
                        <div className="comment-content">
                          <div className="comment-meta">
                            <span className="comment-username">{rep.author.name} <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 400 }}>({rep.author.role || "User"})</span></span>
                            <span>{rep.createdAt}</span>
                          </div>
                          <p className="comment-text">{rep.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "15px 0" }}>No comments yet. Be the first to start the conversation!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Boards lists */
            <div className="community-grid-layout">
              <div className="community-main-column">
                {/* Search / Filters Panel */}
                <div className="forum-controls-row">
                  <div className="search-input-wrapper">
                    <span className="search-input-icon"><FaSearch /></span>
                    <input
                      type="text"
                      placeholder="Search posts, descriptions, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    value={discussionCategory}
                    onChange={(e) => setDiscussionCategory(e.target.value)}
                    className="composer-select"
                    style={{ width: "150px", marginBottom: 0, height: "38px" }}
                  >
                    <option value="All">All Categories</option>
                    <option value="Announcements">Announcements</option>
                    <option value="General">General</option>
                    <option value="Help">Q&A / Help</option>
                    <option value="Resources">Resources</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Career">Career Development</option>
                  </select>
                </div>

                {/* Discussions Feed */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map((disc) => (
                      <div
                        key={disc.id}
                        className={`forum-thread-card ${disc.isPinned ? "pinned" : ""}`}
                        onClick={() => setSelectedDiscussion(disc)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="vote-widget">
                          <button
                            className={`vote-btn ${disc.isLiked ? "upvoted" : ""}`}
                            onClick={(e) => handleVoteDiscussion(disc.id, e)}
                          >
                            <FaChevronUp />
                          </button>
                          <span className="vote-count">{disc.upvotes}</span>
                        </div>
                        <div className="thread-info">
                          <div className="thread-header-row">
                            <Avatar src={disc.author.avatar} alt={disc.author.name} size="xs" />
                            <span className="thread-author-name">{disc.author.name}</span>
                            {disc.author.badge && <span className="thread-author-badge">{disc.author.badge}</span>}
                            <span>• {disc.createdAt}</span>
                            <span className={`category-badge ${disc.category.toLowerCase()}`}>{disc.category}</span>
                            {disc.isPinned && <span style={{ color: "#f59e0b", fontSize: "10px", fontWeight: "bold" }}>📌 PINNED</span>}
                          </div>
                          <h3 className="thread-title">{disc.title}</h3>
                          <p className="thread-snippet">{disc.content}</p>
                          <div className="thread-footer">
                            <div className="thread-tags-row">
                              {disc.tags.map(t => (
                                <span key={t} className="thread-tag">#{t}</span>
                              ))}
                            </div>
                            <div className="thread-meta-indicators">
                              <span className="thread-meta-indicator">💬 {disc.repliesCount} comments</span>
                              <span className="thread-meta-indicator">👁 {disc.views} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Card style={{ textAlign: "center", padding: "40px" }}>
                      <h3>No discussions found</h3>
                      <p style={{ color: "#64748b", fontSize: "13px" }}>Try tweaking your category filters or search query.</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Rules and Categories info */}
              <div className="community-side-column">
                <Card>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "14px", margin: "0 0 12px 0" }}>📖 Community Rules</h3>
                  <ol style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "15px", lineHeight: "1.7" }}>
                    <li style={{ marginBottom: "8px" }}>Be civil and construct comments with supportive feedback.</li>
                    <li style={{ marginBottom: "8px" }}>Keep queries clear; use code blocks for snippets.</li>
                    <li style={{ marginBottom: "8px" }}>No spamming or off-topic advertising.</li>
                    <li style={{ marginBottom: "8px" }}>Share open source assets where possible.</li>
                  </ol>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Study Groups (Discord-like layout) */}
      {activeTab === "study-groups" && (
        <div className="fade-in">
          {/* Main Controls Search */}
          <div style={{ marginBottom: "20px" }}>
            <div className="search-input-wrapper" style={{ maxWidth: "400px" }}>
              <span className="search-input-icon"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search study groups, channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="discord-layout">
            {/* Rooms sidebar channel selector */}
            <div className="discord-rooms-sidebar">
              <div className="discord-sidebar-header">💬 Study Groups</div>
              <div className="discord-channel-list">
                {filteredStudyGroups.map((g) => (
                  <div
                    key={g.id}
                    className={`discord-channel-item ${g.id === activeGroupId ? "active" : ""}`}
                    onClick={() => setActiveGroupId(g.id)}
                  >
                    <span>
                      <span className="discord-channel-hash">#</span>
                      {g.name.split(" ").slice(1).join(" ") || g.name}
                    </span>
                    <span style={{ fontSize: "10px", background: "var(--surface-3)", padding: "1px 5px", borderRadius: "8px" }}>
                      {g.membersCount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active group settings description cards */}
              <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid var(--border-default)" }}>
                <p style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: 700, margin: "0 0 6px 0" }}>ABOUT CHANNEL</p>
                <p style={{ fontSize: "10.5px", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
                  {activeGroup?.description}
                </p>
                <div style={{ marginTop: "15px" }}>
                  <Button
                    size="xs"
                    onClick={(e) => toggleJoinGroup(activeGroup.id, e)}
                    type={activeGroup?.joined ? "outline" : "primary"}
                    style={{ width: "100%" }}
                  >
                    {activeGroup?.joined ? "Leave Group" : "Join Group"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="discord-chat-container">
              <div className="discord-chat-header">
                <div className="discord-chat-title">
                  <span>💬</span>
                  {activeGroup?.name}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  Status: <span style={{ color: activeGroup?.status === "Active" ? "#22c55e" : "#94a3b8", fontWeight: "bold" }}>{activeGroup?.status}</span>
                </div>
              </div>

              {/* Messages feed logs scrollbar container */}
              <div className="discord-chat-log">
                {activeGroup?.chatHistory.map((msg) => (
                  <div key={msg.id} className="discord-message-item">
                    <Avatar src={msg.author.avatar} alt={msg.author.name} size="sm" />
                    <div className="discord-message-content">
                      <div className="discord-msg-meta">
                        <span className="discord-msg-author">{msg.author.name}</span>
                        <span className="discord-msg-time">{msg.timestamp}</span>
                      </div>
                      <div className="discord-msg-text">{msg.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Text Input Message Composer */}
              <div className="discord-input-container">
                {activeGroup?.joined ? (
                  <div className="discord-input-box">
                    <input
                      type="text"
                      placeholder={`Message #${activeGroup?.name.split(" ").slice(1).join(" ")}...`}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                    />
                    <button className="discord-send-btn" onClick={handleSendMessage}>
                      <FaPaperPlane />
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", marginRight: "10px" }}>You are not a member of this study group.</span>
                    <Button size="xs" onClick={(e) => toggleJoinGroup(activeGroup.id, e)} type="primary">Join Group</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Online Member Sidebar */}
            <div className="discord-members-sidebar">
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: "10px" }}>ONLINE — 3</div>
              <div className="discord-member-item">
                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" alt="Sarah Chen" size="xs" />
                <span className="discord-member-name" style={{ color: "#a78bfa" }}>Sarah Chen (AI Res)</span>
              </div>
              <div className="discord-member-item">
                <Avatar src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" alt="Vikram Malhotra" size="xs" />
                <span className="discord-member-name" style={{ color: "#60a5fa" }}>Vikram M. (Mentor)</span>
              </div>
              <div className="discord-member-item">
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" alt="Alex Rivera" size="xs" />
                <span className="discord-member-name" style={{ color: "#ffffff" }}>Alex Rivera</span>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", margin: "15px 0 10px 0" }}>OFFLINE — 2</div>
              <div className="discord-member-item">
                <Avatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" alt="Elena Rostova" size="xs" style={{ opacity: 0.4 }} />
                <span className="discord-member-name" style={{ color: "#64748b" }}>Elena Rostova</span>
              </div>
              <div className="discord-member-item">
                <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" alt="Marcus Aurelius" size="xs" style={{ opacity: 0.4 }} />
                <span className="discord-member-name" style={{ color: "#64748b" }}>Marcus Aurelius</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="community-glass-card fade-in">
          {/* Selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: 0 }}>📊 Community Contributor Rankings</h3>
            <div className="leaderboard-toggle">
              <button
                className={`leaderboard-toggle-btn ${leaderboardPeriod === "weekly" ? "active" : ""}`}
                onClick={() => setLeaderboardPeriod("weekly")}
              >
                Weekly Grind
              </button>
              <button
                className={`leaderboard-toggle-btn ${leaderboardPeriod === "monthly" ? "active" : ""}`}
                onClick={() => setLeaderboardPeriod("monthly")}
              >
                Monthly Stars
              </button>
              <button
                className={`leaderboard-toggle-btn ${leaderboardPeriod === "allTime" ? "active" : ""}`}
                onClick={() => setLeaderboardPeriod("allTime")}
              >
                All-Time Legends
              </button>
            </div>
          </div>

          {/* Podium for top 3 */}
          <div className="podium-container">
            {/* Rank 2 */}
            {leaderboard[leaderboardPeriod]?.[1] && (
              <div className="podium-place second">
                <div className="podium-avatar-wrapper">
                  <Avatar src={leaderboard[leaderboardPeriod][1].avatar} alt={leaderboard[leaderboardPeriod][1].name} size="md" />
                </div>
                <div className="podium-pedestal">
                  <span className="podium-number">2</span>
                  <span className="podium-name">{leaderboard[leaderboardPeriod][1].name}</span>
                  <span className="podium-points">{leaderboard[leaderboardPeriod][1].points} pts</span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {leaderboard[leaderboardPeriod]?.[0] && (
              <div className="podium-place first">
                <div className="podium-avatar-wrapper">
                  <span className="podium-crown">👑</span>
                  <Avatar src={leaderboard[leaderboardPeriod][0].avatar} alt={leaderboard[leaderboardPeriod][0].name} size="lg" style={{ border: "2px solid #fbbf24" }} />
                </div>
                <div className="podium-pedestal">
                  <span className="podium-number">1</span>
                  <span className="podium-name">{leaderboard[leaderboardPeriod][0].name}</span>
                  <span className="podium-points">{leaderboard[leaderboardPeriod][0].points} pts</span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {leaderboard[leaderboardPeriod]?.[2] && (
              <div className="podium-place third">
                <div className="podium-avatar-wrapper">
                  <Avatar src={leaderboard[leaderboardPeriod][2].avatar} alt={leaderboard[leaderboardPeriod][2].name} size="md" />
                </div>
                <div className="podium-pedestal">
                  <span className="podium-number">3</span>
                  <span className="podium-name">{leaderboard[leaderboardPeriod][2].name}</span>
                  <span className="podium-points">{leaderboard[leaderboardPeriod][2].points} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Table List */}
          <div className="leaderboard-list">
            <span className="community-section-label">Top Grinders List</span>
            {leaderboard[leaderboardPeriod]?.map((user, idx) => (
              <div key={user.name} className="leaderboard-row">
                <div className="leaderboard-rank">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </div>
                <div className="leaderboard-user-col">
                  <Avatar src={user.avatar} alt={user.name} size="sm" />
                  <div>
                    <span className="leaderboard-username">{user.name}</span>
                    {user.name === currentUser.name && <span style={{ marginLeft: "6px", fontSize: "10px", background: "#2563eb", color: "white", padding: "1px 5px", borderRadius: "4px" }}>You</span>}
                  </div>
                  {user.badge && <span className="leaderboard-userbadge">{user.badge}</span>}
                </div>
                <div className="leaderboard-points-col">
                  <span className="leaderboard-row-pts">{user.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Coding Challenges */}
      {activeTab === "challenges" && (
        <div className="fade-in">
          {/* Challenge Selector */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" }}>
            {challenges.map(chal => (
              <button
                key={chal.id}
                onClick={() => setActiveChallengeId(chal.id)}
                style={{
                  background: chal.id === activeChallengeId ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 41, 59, 0.4)",
                  border: `1px solid ${chal.id === activeChallengeId ? "#10b981" : "rgba(255,255,255,0.06)"}`,
                  color: chal.id === activeChallengeId ? "#34d399" : "#94a3b8",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  whiteSpace: "nowrap"
                }}
              >
                {chal.title} <span style={{ fontSize: "10px", marginLeft: "4px", color: chal.difficulty === "Easy" ? "#10b981" : chal.difficulty === "Medium" ? "#f59e0b" : "#ef4444" }}>({chal.difficulty})</span>
              </button>
            ))}
          </div>

          <div className="challenge-workspace">
            {/* Left Column: Instructions */}
            <div className="challenge-desc-panel">
              <h3 style={{ color: "var(--text-primary)", fontSize: "18px", margin: "0 0 10px 0" }}>💻 {activeChallenge?.title}</h3>
              <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                <span className={`category-badge ${activeChallenge?.difficulty.toLowerCase()}`} style={{ background: activeChallenge?.difficulty === "Easy" ? "rgba(16,185,129,0.12)" : activeChallenge?.difficulty === "Medium" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)", color: activeChallenge?.difficulty === "Easy" ? "#34d399" : activeChallenge?.difficulty === "Medium" ? "#fbbf24" : "#f87171" }}>
                  {activeChallenge?.difficulty}
                </span>
                <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>+{activeChallenge?.points} XP Points</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{activeChallenge?.solvedCount} Solved</span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <p>{activeChallenge?.description}</p>
                <div style={{ marginTop: "20px", background: "var(--surface-3)", padding: "12px", borderRadius: "6px" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "12.5px", margin: "0 0 6px 0" }}>Test Case Example:</h4>
                  <pre style={{ margin: 0, fontSize: "11px", color: "var(--accent)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    {activeChallenge?.testCases[0]?.input}
                  </pre>
                  <p style={{ margin: "10px 0 2px 0", fontSize: "11px", color: "var(--text-tertiary)" }}>Expected output:</p>
                  <pre style={{ margin: 0, fontSize: "11px", color: "var(--success)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    {activeChallenge?.testCases[0]?.expectedOutput}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor */}
            <div className="challenge-editor-panel">
              <div className="editor-header">
                <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>Code Workspace Sandbox</span>
                <select defaultValue="javascript">
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="python">Python 3</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div className="editor-textarea-wrapper">
                <textarea
                  className="editor-code-textarea"
                  value={challengeCode}
                  onChange={(e) => setChallengeCode(e.target.value)}
                />
              </div>

              <div className="editor-console-output">
                <div className="console-title">Execution Console Output</div>
                <div className={`console-text ${consoleIsError ? "error" : ""}`}>
                  {consoleLogs}
                </div>
              </div>

              <div className="editor-actions">
                <Button onClick={() => handleRunChallenge(false)} type="outline">Run Local Tests</Button>
                <Button onClick={() => handleRunChallenge(true)} type="primary">Submit Solution</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Project Showcase */}
      {activeTab === "showcase" && (
        <div className="fade-in">
          {selectedShowcase ? (
            /* Selected Project details panel */
            <div className="community-glass-card fade-in">
              <Button onClick={() => setSelectedShowcase(null)} type="outline" size="sm" style={{ marginBottom: "15px" }}>
                ← Back to Project Hub
              </Button>

              <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px", flexWrap: "wrap" }}>
                {/* Visual Image Gradient Placeholder */}
                <div style={{
                  width: "100%",
                  height: "200px",
                  background: selectedShowcase.imageGradient,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: 900,
                  textShadow: "0 4px 8px rgba(0,0,0,0.5)"
                }}>
                  {selectedShowcase.title}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <h2 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 800, margin: 0 }}>{selectedShowcase.title}</h2>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {selectedShowcase.githubUrl && (
                        <a href={selectedShowcase.githubUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                          <Button size="xs" type="outline"><FaGithub style={{ marginRight: "4px" }} /> Repository</Button>
                        </a>
                      )}
                      {selectedShowcase.liveUrl && (
                        <a href={selectedShowcase.liveUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                          <Button size="xs" type="primary"><FaExternalLinkAlt style={{ marginRight: "4px" }} /> Live Demo</Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "12px", lineHeight: "1.6" }}>
                    {selectedShowcase.description}
                  </p>

                  <div style={{ marginTop: "15px" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "0 0 6px 0", fontWeight: 800 }}>TECHNOLOGY STACK</p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {selectedShowcase.techStack.map(stack => (
                        <span key={stack} className="showcase-stack-badge" style={{ background: "var(--accent-subtle)", color: "var(--primary)", padding: "3px 8px" }}>{stack}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments block */}
              <div className="comments-section">
                <h3 style={{ color: "var(--text-primary)", fontSize: "14px", marginBottom: "15px" }}>💬 Project Reviews & Feedback ({selectedShowcase.commentsCount})</h3>
                <div className="comment-input-row">
                  <input
                    type="text"
                    placeholder="Provide constructive review, praise, or suggestions..."
                    value={newProjectCommentText}
                    onChange={(e) => setNewProjectCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddShowcaseComment(); }}
                  />
                  <Button onClick={handleAddShowcaseComment} type="primary">Post Review</Button>
                </div>

                <div className="comment-list">
                  {selectedShowcase.comments.length > 0 ? (
                    selectedShowcase.comments.map(c => (
                      <div key={c.id} className="comment-item">
                        <Avatar src={c.avatar} alt={c.name} size="sm" />
                        <div className="comment-content">
                          <div className="comment-meta">
                            <span className="comment-username">{c.name}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="comment-text">{c.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "15px 0" }}>No feedback left yet. Add your thoughts above!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Cards listing */
            <div className="fade-in">
              <div className="forum-controls-row">
                <div className="search-input-wrapper" style={{ maxWidth: "400px" }}>
                  <span className="search-input-icon"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search projects by title, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowShowcaseComposer(true)} type="primary">
                  <FaPlus style={{ marginRight: "6px" }} /> Share Your Project
                </Button>
              </div>

              <div className="showcase-cards-grid">
                {filteredShowcase.length > 0 ? (
                  filteredShowcase.map((proj) => (
                    <div key={proj.id} className="showcase-card" onClick={() => setSelectedShowcase(proj)} style={{ cursor: "pointer" }}>
                      <div className="showcase-card-image" style={{ background: proj.imageGradient }}>
                        {proj.title.split(":")[0]}
                      </div>
                      <div className="showcase-card-body">
                        <div className="showcase-card-author">
                          <Avatar src={proj.author.avatar} alt={proj.author.name} size="xs" />
                          <span>by {proj.author.name}</span>
                        </div>
                        <h3 className="showcase-card-title">{proj.title}</h3>
                        <p className="showcase-card-desc">{proj.description}</p>
                        <div className="showcase-card-stack">
                          {proj.techStack.slice(0, 3).map(tech => (
                            <span key={tech} className="showcase-stack-badge">{tech}</span>
                          ))}
                          {proj.techStack.length > 3 && <span className="showcase-stack-badge">+{proj.techStack.length - 3}</span>}
                        </div>
                        <div className="showcase-card-footer">
                          <button
                            onClick={(e) => handleVoteShowcase(proj.id, e)}
                            style={{
                              background: "none",
                              border: "none",
                              color: proj.isLiked ? "#3b82f6" : "#64748b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <FaChevronUp /> {proj.upvotes}
                          </button>
                          <span>💬 {proj.commentsCount} reviews</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: "span 3" }}>
                    <Card style={{ textAlign: "center", padding: "40px" }}>
                      <h3>No projects found</h3>
                      <p style={{ color: "#64748b", fontSize: "13px" }}>Be the first to share a project showcase!</p>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Weekly Competitions */}
      {activeTab === "competitions" && (
        <div className="community-main-column fade-in" style={{ gridColumn: "span 12" }}>
          {competitions.map(comp => (
            <div key={comp.id} className="community-glass-card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "18px", margin: "0 0 6px 0" }}>{comp.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12.5px", margin: 0 }}>Prizes Pool: <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{comp.prizePool}</span> • {comp.participantsCount} Developers Registered</p>
                </div>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 10px", borderRadius: "6px", color: "#f87171", fontSize: "11px", fontWeight: "bold" }}>
                  ⏳ {comp.timeLeft}
                </div>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", margin: "15px 0", lineHeight: "1.5" }}>
                {comp.description}
              </p>

              {/* Rules and submission details */}
              <div style={{ background: "var(--surface-3)", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ color: "var(--text-primary)", fontSize: "12.5px", margin: "0 0 8px 0" }}>Competition Rules:</h4>
                <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {comp.rules.map((rule, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <Button
                  onClick={() => {
                    setCompetitions(prev =>
                      prev.map(c => c.id === comp.id ? { ...c, joined: !c.joined, participantsCount: c.joined ? c.participantsCount - 1 : c.participantsCount + 1 } : c)
                    );
                  }}
                  type={comp.joined ? "outline" : "primary"}
                >
                  {comp.joined ? "Joined ✓" : "Register Now"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Mentor Section */}
      {activeTab === "mentors" && (
        <div className="fade-in">
          {/* Header Search filters */}
          <div style={{ marginBottom: "20px" }}>
            <div className="search-input-wrapper" style={{ maxWidth: "400px" }}>
              <span className="search-input-icon"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search mentors by name, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mentors-directory">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((ment) => (
                <div key={ment.id} className="mentor-card">
                  <div className="mentor-profile-col">
                    <Avatar src={ment.avatar} alt={ment.name} size="md" />
                    <div className="mentor-stars">
                      ⭐ {ment.rating}
                    </div>
                    <span style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>({ment.reviewsCount} sessions)</span>
                  </div>
                  <div className="mentor-info-col">
                    <h3 className="mentor-name">{ment.name}</h3>
                    <p className="mentor-role">{ment.role} at <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{ment.company}</span></p>
                    <p className="mentor-bio">{ment.bio}</p>
                    <div className="mentor-skills">
                      {ment.skills.map(sk => (
                        <span key={sk} className="mentor-skill-tag">{sk}</span>
                      ))}
                    </div>
                    <Button size="xs" onClick={() => setBookingMentor(ment)} type="primary" style={{ background: "linear-gradient(90deg, #8b5cf6, #d8b4fe)", border: "none" }}>
                      Book 1-on-1 Session
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "span 2" }}>
                <Card style={{ textAlign: "center", padding: "40px" }}>
                  <h3>No mentors found</h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>Try updating your search query filters.</p>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Bookmarks */}
      {activeTab === "bookmarks" && (
        <div className="community-main-column fade-in" style={{ gridColumn: "span 12" }}>
          {bookmarkedDiscussions.length > 0 ? (
            bookmarkedDiscussions.map((disc) => (
              <div
                key={disc.id}
                className="forum-thread-card"
                onClick={() => { setSelectedDiscussion(disc); setActiveTab("discussions"); }}
                style={{ cursor: "pointer" }}
              >
                <div className="vote-widget">
                  <button
                    className={`vote-btn ${disc.isLiked ? "upvoted" : ""}`}
                    onClick={(e) => handleVoteDiscussion(disc.id, e)}
                  >
                    <FaChevronUp />
                  </button>
                  <span className="vote-count">{disc.upvotes}</span>
                </div>
                <div className="thread-info">
                  <div className="thread-header-row">
                    <Avatar src={disc.author.avatar} alt={disc.author.name} size="xs" />
                    <span className="thread-author-name">{disc.author.name}</span>
                    <span>• {disc.createdAt}</span>
                    <span className={`category-badge ${disc.category.toLowerCase()}`}>{disc.category}</span>
                  </div>
                  <h3 className="thread-title">{disc.title}</h3>
                  <p className="thread-snippet">{disc.content}</p>
                  <div className="thread-footer">
                    <div className="thread-tags-row">
                      {disc.tags.map(t => (
                        <span key={t} className="thread-tag">#{t}</span>
                      ))}
                    </div>
                    <div className="thread-meta-indicators">
                      <span className="thread-meta-indicator">💬 {disc.repliesCount} comments</span>
                      <span className="thread-meta-indicator">👁 {disc.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Card style={{ textAlign: "center", padding: "60px" }}>
              <h2 style={{ fontSize: "28px" }}>🔖 No bookmarks saved</h2>
              <p style={{ color: "#64748b", margin: "10px 0 0" }}>Bookmark helpful discussions and guides so they show up here!</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Inbox / Notifications */}
      {activeTab === "notifications" && (
        <div className="community-main-column fade-in" style={{ gridColumn: "span 12" }}>
          <div className="community-glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-default)", paddingBottom: "12px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: 0 }}>🔔 Activity Notifications Inbox</h3>
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}
              >
                Mark all as read
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notifications.map(not => (
                <div
                  key={not.id}
                  style={{
                    padding: "12px 16px",
                    background: not.read ? "var(--surface-1)" : "var(--accent-subtle)",
                    border: `1px solid ${not.read ? "var(--border-default)" : "var(--accent)"}`,
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px" }}>{not.type === "reply" ? "💬" : not.type === "like" ? "👍" : not.type === "challenge" ? "💻" : "📅"}</span>
                    <span style={{ fontSize: "13px", color: not.read ? "var(--text-secondary)" : "var(--text-primary)", fontWeight: not.read ? 400 : 600 }}>{not.text}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{not.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Slot Modal */}
      {bookingMentor && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: 0 }}>📅 Book Session with {bookingMentor.name}</h3>
              <button onClick={() => setBookingMentor(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "36px" }}>🎉</span>
                <h4 style={{ color: "var(--success)", margin: "10px 0 5px 0" }}>Booking Confirmed!</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: 0 }}>Check your inbox log for slot details.</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.4", margin: "0 0 15px 0" }}>
                  Select one of {bookingMentor.name}'s weekly available slots for a direct Zoom calibration call.
                </p>

                {/* Day selector */}
                <p style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: 800, margin: "0 0 6px 0" }}>SELECT AVAILABLE DAY</p>
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  {bookingMentor.availableSlots.map(slot => (
                    <button
                      key={slot.day}
                      onClick={() => { setSelectedDay(slot.day); setSelectedTime(""); }}
                      style={{
                        padding: "6px 12px",
                        background: selectedDay === slot.day ? "var(--primary)" : "var(--surface-2)",
                        border: `1px solid ${selectedDay === slot.day ? "var(--primary)" : "var(--border-default)"}`,
                        color: "var(--text-primary)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      {slot.day === "Mon" ? "Monday" : slot.day === "Tue" ? "Tuesday" : slot.day === "Wed" ? "Wednesday" : slot.day === "Thu" ? "Thursday" : "Friday"}
                    </button>
                  ))}
                </div>

                {/* Time selector */}
                {selectedDay && (
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: 800, margin: "0 0 6px 0" }}>SELECT SESSION TIME</p>
                    <div className="booking-slot-grid">
                      {bookingMentor.availableSlots.find(s => s.day === selectedDay)?.times.map(t => (
                        <button
                          key={t}
                          className={`booking-slot-btn ${selectedTime === t ? "selected" : ""}`}
                          onClick={() => setSelectedTime(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <Button onClick={() => setBookingMentor(null)} type="outline">Cancel</Button>
                  <Button onClick={handleBookSlot} type="primary" disabled={!selectedDay || !selectedTime}>Confirm Booking</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Discussion Composer Modal */}
      {showComposer && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ width: "550px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: 0 }}>💬 Create a New Discussion Thread</h3>
              <button onClick={() => setShowComposer(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
            </div>

            <input
              type="text"
              placeholder="Title (e.g. Help with vector search latency...)"
              className="composer-input"
              value={composerTitle}
              onChange={(e) => setComposerTitle(e.target.value)}
            />

            <select
              value={composerCategory}
              onChange={(e) => setComposerCategory(e.target.value)}
              className="composer-select"
            >
              <option value="General">General Discussion</option>
              <option value="Help">Q&A / Help Request</option>
              <option value="Resources">Developer Resource / Guide</option>
              <option value="Showcase">Project Showcase</option>
              <option value="Career">Career Placement & Advice</option>
            </select>

            <input
              type="text"
              placeholder="Tags (comma-separated, e.g. RAG, pinecone, python)"
              className="composer-input"
              value={composerTags}
              onChange={(e) => setComposerTags(e.target.value)}
            />

            <textarea
              placeholder="Write thread contents. You can paste snippets or detail what hurdles you are encountering..."
              className="composer-textarea"
              value={composerContent}
              onChange={(e) => setComposerContent(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button onClick={() => setShowComposer(false)} type="outline">Cancel</Button>
              <Button onClick={handleCreatePost} type="primary" disabled={!composerTitle || !composerContent}>Publish Post</Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Showcase Project Composer Modal */}
      {showShowcaseComposer && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ width: "550px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: 0 }}>🚀 Share a Project Showcase</h3>
              <button onClick={() => setShowShowcaseComposer(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}><FaTimes /></button>
            </div>

            <input
              type="text"
              placeholder="Project Title (e.g. ChatBot.ai)"
              className="composer-input"
              value={showcaseTitle}
              onChange={(e) => setShowcaseTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Short Description (e.g. Autonomous multi-agent pipeline...)"
              className="composer-input"
              value={showcaseDescription}
              onChange={(e) => setShowcaseDescription(e.target.value)}
            />

            <input
              type="text"
              placeholder="GitHub Repository URL (Optional)"
              className="composer-input"
              value={showcaseGithub}
              onChange={(e) => setShowcaseGithub(e.target.value)}
            />

            <input
              type="text"
              placeholder="Live Demo Link URL (Optional)"
              className="composer-input"
              value={showcaseLive}
              onChange={(e) => setShowcaseLive(e.target.value)}
            />

            <input
              type="text"
              placeholder="Tags (e.g. multi-agent, TTS)"
              className="composer-input"
              value={showcaseTags}
              onChange={(e) => setShowcaseTags(e.target.value)}
            />

            <input
              type="text"
              placeholder="Tech Stack (comma-separated, e.g. React, Python, S3)"
              className="composer-input"
              value={showcaseStack}
              onChange={(e) => setShowcaseStack(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button onClick={() => setShowShowcaseComposer(false)} type="outline">Cancel</Button>
              <Button onClick={handleCreateShowcase} type="primary" disabled={!showcaseTitle || !showcaseDescription}>Share Showcase</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(CommunityPage);
