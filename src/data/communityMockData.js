export const initialDiscussions = [
  {
    id: "disc-1",
    title: "📢 AI Engineer OS Beta Release - Welcome & Getting Started Guide!",
    content: "Welcome to the AI Engineer OS community! This platform is designed to help you fast-track your journey to becoming a world-class AI Engineer. In this community, you can join study groups, collaborate on challenges, share your portfolio projects, and book sessions with AI mentors. Start by introducing yourself in the comments below! Tell us your background, what you're working on, and your goals.",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Lead Platform Architect",
      badge: "Staff"
    },
    category: "Announcements",
    tags: ["Beta", "Guide", "Welcome"],
    upvotes: 48,
    repliesCount: 3,
    views: 312,
    createdAt: "2 hours ago",
    isPinned: true,
    isTrending: false,
    isLiked: true,
    isBookmarked: true,
    replies: [
      {
        id: "rep-1-1",
        author: {
          name: "Dr. Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          role: "AI Research Scientist"
        },
        content: "Awesome platform! Excited to connect with fellow researchers and engineering builders here. I'm focusing on LLM alignment and agentic evaluation methodologies.",
        createdAt: "1 hour ago",
        likes: 12,
        isLiked: false
      },
      {
        id: "rep-1-2",
        author: {
          name: "Marcus Aurelius",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MSc Student"
        },
        content: "This is exactly what I needed! Looking for partners to grind the LeetCode challenges and study agentic workflows together. Feel free to ping me!",
        createdAt: "45 mins ago",
        likes: 5,
        isLiked: true
      },
      {
        id: "rep-1-3",
        author: {
          name: "Devon Lane",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MLOps Engineer"
        },
        content: "Outstanding UI! The dashboard analytics integration feels incredibly premium. Let's build some amazing projects.",
        createdAt: "12 mins ago",
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: "disc-2",
    title: "🔥 Let's talk about Agentic RAG: LangGraph vs AutoGen vs CrewAI?",
    content: "I'm architecting a multi-agent system to ingest a vast repository of enterprise PDFs and perform dynamic structured extraction and synthesis. LangGraph gives me precise flow control (DAGs and state machine graphs), whereas AutoGen is great for conversational dialogs, and CrewAI is easy to set up for role-playing. What are your production experiences with these? Which one scales better when dealing with state updates and complex loops?",
    author: {
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Senior AI Engineer",
      badge: "Mentor"
    },
    category: "General",
    tags: ["Multi-Agents", "RAG", "LangGraph", "CrewAI"],
    upvotes: 35,
    repliesCount: 2,
    views: 184,
    createdAt: "5 hours ago",
    isPinned: false,
    isTrending: true,
    isLiked: false,
    isBookmarked: false,
    replies: [
      {
        id: "rep-2-1",
        author: {
          name: "Alex Rivera",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          role: "Lead Platform Architect"
        },
        content: "In production, we found LangGraph to be the most deterministic and easiest to debug because of its graph-based state visualizer. CrewAI is perfect for quick prototyping, but keeping custom agent state aligned across deep nested loops can become tricky.",
        createdAt: "3 hours ago",
        likes: 18,
        isLiked: true
      },
      {
        id: "rep-2-2",
        author: {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          role: "AI Research Scientist"
        },
        content: "Agreed. Also, consider custom state routers. Often, a custom light state router built directly in FastAPI or Express can outperform heavy frameworks if your workflows are mostly sequential.",
        createdAt: "2 hours ago",
        likes: 9,
        isLiked: false
      }
    ]
  },
  {
    id: "disc-3",
    title: "💡 Tutorial: Optimizing LLM Context Windows with Semantic Chunking",
    content: "Most simple RAG pipelines split documents by token count (e.g. 500 tokens). This completely destroys the contextual flow when a sentence gets sliced in half. Here is a small python snippet to achieve semantic chunking by analyzing adjacent sentence embeddings and splitting them where distance exceeds a threshold. Let me know if you want the full repository link!",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      role: "NLP Specialist"
    },
    category: "Resources",
    tags: ["Embeddings", "RAG", "Python", "Tutorial"],
    upvotes: 56,
    repliesCount: 1,
    views: 402,
    createdAt: "1 day ago",
    isPinned: false,
    isTrending: true,
    isLiked: false,
    isBookmarked: true,
    replies: [
      {
        id: "rep-3-1",
        author: {
          name: "Vikram Malhotra",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
          role: "Senior AI Engineer"
        },
        content: "This is gold, Elena! Semantic chunking boosted our retrieval recall metrics by nearly 14%. Would love the link to the full repo.",
        createdAt: "18 hours ago",
        likes: 6,
        isLiked: false
      }
    ]
  },
  {
    id: "disc-4",
    title: "❓ Having trouble with Ollama Docker deployment on AWS ECS",
    content: "Hey folks, I'm trying to run Ollama inside an AWS ECS cluster using Fargate. I keep running into GPU resource allocation issues and containers crashing during deep inference. Has anyone successfully run containerized local LLMs on AWS Fargate, or do I have to spin up full EC2 g5 instances? Any template configurations would be incredibly helpful!",
    author: {
      name: "Marcus Aurelius",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "MSc Student"
    },
    category: "Help",
    tags: ["Ollama", "Docker", "AWS", "ECS", "DevOps"],
    upvotes: 14,
    repliesCount: 1,
    views: 95,
    createdAt: "2 days ago",
    isPinned: false,
    isTrending: false,
    isLiked: false,
    isBookmarked: false,
    replies: [
      {
        id: "rep-4-1",
        author: {
          name: "Devon Lane",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MLOps Engineer"
        },
        content: "AWS Fargate does not support GPU virtualization yet. You must use ECS with EC2 launch type (using GPU-optimized AMIs) or deploy via EKS with NVIDIA container toolkit plugins.",
        createdAt: "1 day ago",
        likes: 11,
        isLiked: true
      }
    ]
  }
];

export const initialStudyGroups = [
  {
    id: "group-1",
    name: "🤖 Agentic Workflows Co-Learn",
    description: "Deep dive into multi-agent patterns, LangGraph, AutoGen, and tool-use mechanics. We build open-source agents together.",
    membersCount: 42,
    status: "Active",
    topic: "Designing Multi-Agent Dialogues",
    joined: true,
    chatHistory: [
      {
        id: "msg-1-1",
        author: {
          name: "Alex Rivera",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          role: "Lead Platform Architect"
        },
        content: "Hey team! Our next live hacking session will be this Thursday. We'll build an automated research agent that searches arXiv and summarizes papers.",
        timestamp: "5 mins ago"
      },
      {
        id: "msg-1-2",
        author: {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          role: "AI Research Scientist"
        },
        content: "Sounds great, Alex! I can share some tips on parsing LaTeX formatting and extracting math formulas accurately.",
        timestamp: "3 mins ago"
      },
      {
        id: "msg-1-3",
        author: {
          name: "Marcus Aurelius",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MSc Student"
        },
        content: "Awesome, count me in! Can we also look at rate-limiting our agents? I hit the Tavily API limit last time in 5 minutes 😂",
        timestamp: "1 min ago"
      }
    ]
  },
  {
    id: "group-2",
    name: "🧠 LeetCode Grind - AI Engineers",
    description: "Daily algorithms and data structures prep focusing on dynamic programming, graphs, and system design questions. Crucial for tech interviews.",
    membersCount: 128,
    status: "Active",
    topic: "Graphs: BFS & DFS Problems",
    joined: false,
    chatHistory: [
      {
        id: "msg-2-1",
        author: {
          name: "Vikram Malhotra",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
          role: "Senior AI Engineer"
        },
        content: "Who wants to jump on a quick whiteboard session for the Graph Valid Tree problem? It's a classic DFS/Union-Find challenge.",
        timestamp: "2 hours ago"
      },
      {
        id: "msg-2-2",
        author: {
          name: "Devon Lane",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MLOps Engineer"
        },
        content: "I'm down in 15 mins! Union-Find is definitely cleaner for detecting cycles in undirected graphs.",
        timestamp: "1 hour ago"
      }
    ]
  },
  {
    id: "group-3",
    name: "⚡ Production MLOps & LLMOps",
    description: "Discussing Docker, Kubernetes, Triton Inference Server, vLLM, Prometheus monitoring, and automated model evaluations in production.",
    membersCount: 89,
    status: "Idle",
    topic: "vLLM Token Throughput Tuning",
    joined: false,
    chatHistory: [
      {
        id: "msg-3-1",
        author: {
          name: "Devon Lane",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          role: "MLOps Engineer"
        },
        content: "Highly recommend configuring `--max-model-len` to prevent OOM errors on smaller V100 rigs when serving Llama 3.",
        timestamp: "Yesterday"
      }
    ]
  }
];

export const initialShowcaseProjects = [
  {
    id: "showcase-1",
    title: "🤖 Agentic DevFlow: Autonomous Code Reviewer",
    description: "An autonomous AI software agent that monitors GitHub repositories. It intercepts Pull Requests, runs AST parsing, performs security linting, writes unit tests, and commits feedback automatically.",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    },
    upvotes: 74,
    isLiked: true,
    commentsCount: 2,
    tags: ["Agentic", "GitHub API", "Python", "LlamaIndex"],
    githubUrl: "https://github.com/example/devflow",
    liveUrl: "https://devflow.ai",
    techStack: ["React", "FastAPI", "PostgreSQL", "OpenAI API"],
    imageGradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    comments: [
      {
        id: "c-sh-1",
        name: "Vikram Malhotra",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
        text: "This is super cool. How do you handle large pull requests that exceed the LLM context window?",
        time: "1 hour ago"
      },
      {
        id: "c-sh-2",
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        text: "We split the diff files dynamically and prioritize modifications inside critical controllers or business logic modules first, sending chunked prompts recursively.",
        time: "45 mins ago"
      }
    ]
  },
  {
    id: "showcase-2",
    title: "🎙️ Multi-Voice Podcaster AI",
    description: "Generates fully simulated podcast episodes from an arbitrary topic query. It structures scripts, creates distinct speaker profiles (host, guest, skeptic), and renders high-fidelity audio streams with natural turn-taking.",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
    },
    upvotes: 62,
    isLiked: false,
    commentsCount: 0,
    tags: ["TTS", "ElevenLabs", "GPT-4o", "Audio"],
    githubUrl: "https://github.com/example/podcaster-ai",
    liveUrl: "https://podcaster.ai",
    techStack: ["Next.js", "Python", "Pinecone", "S3"],
    imageGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    comments: []
  },
  {
    id: "showcase-3",
    title: "📊 FinanceAgent: Real-time Stock Sentiment Synthesis",
    description: "An autonomous agent searching Twitter, Reddit, and SEC filings. It aggregates sentiment trends, parses financial charts using multimodal models, and crafts detailed trading recommendation reports.",
    author: {
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80"
    },
    upvotes: 51,
    isLiked: false,
    commentsCount: 0,
    tags: ["Finance", "Multimodal", "Tavily", "Anthropic"],
    githubUrl: "https://github.com/example/financeagent",
    liveUrl: "",
    techStack: ["Python", "Streamlit", "Qdrant", "Claude 3"],
    imageGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    comments: []
  }
];

export const initialChallenges = [
  {
    id: "chal-1",
    title: "Write a Recursive JSON Summarizer",
    description: "In agent workflows, you often receive raw nested JSON outputs that contain redundant tokens. Write a function `summarizeJSON(obj)` that takes a nested object and returns a flattened object containing only keys that end with 'important', 'status', or 'error', removing all other metadata keys. If a key points to a nested object, traverse it recursively.",
    difficulty: "Easy",
    points: 100,
    solvedCount: 142,
    starterCode: `function summarizeJSON(obj) {
  // Your code here
  let result = {};
  
  function recurse(current, parentKey = '') {
    for (let key in current) {
      const fullKey = parentKey ? \`\${parentKey}.\${key}\` : key;
      const value = current[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        recurse(value, fullKey);
      } else {
        if (key.endsWith('important') || key.endsWith('status') || key.endsWith('error')) {
          result[fullKey] = value;
        }
      }
    }
  }
  
  recurse(obj);
  return result;
}`,
    testCases: [
      {
        input: '{\n  "metadata": "123",\n  "status": "active",\n  "data": {\n    "critical_important": true,\n    "unused": "abc"\n  }\n}',
        expectedOutput: '{\n  "status": "active",\n  "data.critical_important": true\n}'
      }
    ],
    solution: `function summarizeJSON(obj) {
  let result = {};
  function recurse(current, parentKey = '') {
    for (let key in current) {
      const fullKey = parentKey ? \`\${parentKey}.\${key}\` : key;
      const value = current[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        recurse(value, fullKey);
      } else {
        if (key.endsWith('important') || key.endsWith('status') || key.endsWith('error')) {
          result[fullKey] = value;
        }
      }
    }
  }
  recurse(obj);
  return result;
}`
  },
  {
    id: "chal-2",
    title: "Cosine Similarity Matrix",
    description: "Implement a function `calculateCosineSimilarity(vectorA, vectorB)` that returns the cosine similarity score (between -1 and 1) of two numerical vectors. This is the foundation of semantic document retrieval.",
    difficulty: "Medium",
    points: 150,
    solvedCount: 98,
    starterCode: `function calculateCosineSimilarity(vecA, vecB) {
  // Compute cosine similarity between vecA and vecB
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  // Implement vector math here
  
  return 0;
}`,
    testCases: [
      {
        input: "[1, 2, 3], [1, 2, 3]",
        expectedOutput: "1"
      },
      {
        input: "[1, 0], [0, 1]",
        expectedOutput: "0"
      }
    ],
    solution: `function calculateCosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}`
  },
  {
    id: "chal-3",
    title: "Implement a Token Rate Limiter",
    description: "Write a token bucket algorithm to rate limit API requests. The function `isRequestAllowed(clientId, bucketCapacity, leakRatePerSec)` must return `true` or `false` based on client request timestamps.",
    difficulty: "Hard",
    points: 250,
    solvedCount: 35,
    starterCode: `// Rate Limiter Token Bucket
const clientBuckets = {};

function isRequestAllowed(clientId, capacity, leakRate) {
  // Implement token bucket rate limiter
  return true;
}`,
    testCases: [
      {
        input: '"client_1", 5, 1',
        expectedOutput: "true"
      }
    ],
    solution: ""
  }
];

export const initialCompetitions = [
  {
    id: "comp-1",
    title: "🏆 AI Agent Hackathon #4: Autonomous Tools",
    description: "Build an AI agent that accomplishes a multi-step task like scraping, data cleansing, and email writing using tool-calling interfaces. Your entry will be judged based on accuracy, token efficiency, and speed.",
    prizePool: "$5,000 Credits & Badges",
    participantsCount: 164,
    timeLeft: "3d 14h left",
    rules: [
      "Must use local LLMs (Ollama) or open APIs.",
      "Submit a working GitHub repository link.",
      "Include a brief video demonstration (max 3 minutes).",
      "Teams up to 3 people are permitted."
    ],
    joined: true
  },
  {
    id: "comp-2",
    title: "⚡ Speed Hack: Prompt Injection Defense",
    description: "Design a wrapper prompt or validation middleware that successfully sanitizes inputs and blocks prompt injection attacks across 20 distinct jailbreak test cases. Highest accuracy score wins.",
    prizePool: "$1,500 Credits & Custom Badge",
    participantsCount: 89,
    timeLeft: "22h 15m left",
    rules: [
      "The defense script must be written in Python or TypeScript.",
      "Latency overhead must remain below 100ms per request.",
      "No external API dependencies inside the evaluation loop."
    ],
    joined: false
  }
];

export const initialMentors = [
  {
    id: "ment-1",
    name: "Dr. Sarah Chen",
    role: "AI Research Scientist",
    company: "DeepMind Tech",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    skills: ["LLM Alignment", "RLHF", "Agentic Systems", "PyTorch"],
    rating: 4.95,
    reviewsCount: 38,
    bio: "Sarah focuses on safety-aligned models and agent training loops. Previously she led research at OpenAI on conversational fine-tuning.",
    availableSlots: [
      { day: "Mon", times: ["10:00 AM", "2:00 PM"] },
      { day: "Wed", times: ["9:00 AM", "4:30 PM"] },
      { day: "Fri", times: ["11:00 AM", "1:00 PM"] }
    ]
  },
  {
    id: "ment-2",
    name: "Vikram Malhotra",
    role: "Senior AI Engineer",
    company: "Autonomous AI Corp",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    skills: ["LangGraph", "Vector Databases", "AWS DevOps", "RAG Systems"],
    rating: 4.88,
    reviewsCount: 52,
    bio: "Vikram builds heavy RAG pipelines in production and manages Kubernetes deployment configurations. He loves teaching DevOps skills.",
    availableSlots: [
      { day: "Tue", times: ["1:00 PM", "3:30 PM", "6:00 PM"] },
      { day: "Thu", times: ["2:00 PM", "4:00 PM"] }
    ]
  },
  {
    id: "ment-3",
    name: "Elena Rostova",
    role: "NLP Specialist & MLOps",
    company: "Hugging Face",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    skills: ["Fine-Tuning", "vLLM Serving", "Quantization", "Model Compressing"],
    rating: 4.97,
    reviewsCount: 29,
    bio: "Elena specializes in making models run faster. Talk to her about quantizing weights, setting up vLLM, and caching strategies.",
    availableSlots: [
      { day: "Wed", times: ["3:00 PM", "5:00 PM"] },
      { day: "Fri", times: ["4:00 PM", "6:30 PM"] }
    ]
  }
];

export const initialLeaderboard = {
  weekly: [
    { rank: 1, name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", points: 840, badge: "Master Contributor" },
    { rank: 2, name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", points: 720, badge: "Algorithm Wizard" },
    { rank: 3, name: "Vikram Malhotra", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80", points: 690, badge: "Helpful Mentor" },
    { rank: 4, name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", points: 550, badge: "Beta Guide" },
    { rank: 5, name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", points: 410, badge: "Rising Star" }
  ],
  monthly: [
    { rank: 1, name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", points: 3100, badge: "Algorithm Wizard" },
    { rank: 2, name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", points: 2950, badge: "Master Contributor" },
    { rank: 3, name: "Vikram Malhotra", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80", points: 2840, badge: "Helpful Mentor" },
    { rank: 4, name: "Devon Lane", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80", points: 1980, badge: "MLOps Guru" },
    { rank: 5, name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", points: 1820, badge: "Beta Guide" }
  ],
  allTime: [
    { rank: 1, name: "Vikram Malhotra", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80", points: 15400, badge: "Helpful Mentor" },
    { rank: 2, name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", points: 14200, badge: "Algorithm Wizard" },
    { rank: 3, name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", points: 13900, badge: "Master Contributor" },
    { rank: 4, name: "Devon Lane", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80", points: 9800, badge: "MLOps Guru" },
    { rank: 5, name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", points: 8700, badge: "Beta Guide" }
  ]
};

export const initialNotifications = [
  { id: "not-1", type: "reply", text: "Dr. Sarah Chen replied to your post 'AI Engineer OS Beta Release'", time: "1 hour ago", read: false },
  { id: "not-2", type: "like", text: "Marcus Aurelius upvoted your comment in 'Let's talk about Agentic RAG'", time: "45 mins ago", read: false },
  { id: "not-3", type: "challenge", text: "Your solution for 'Write a Recursive JSON Summarizer' was approved! (+100 pts)", time: "2 hours ago", read: true },
  { id: "not-4", type: "group", text: "You were added to '🤖 Agentic Workflows Co-Learn'", time: "2 days ago", read: true }
];
