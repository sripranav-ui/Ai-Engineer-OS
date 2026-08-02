export const initialSkillsGap = [
  {
    id: "sg-1",
    name: "Python Advanced & Async IO",
    category: "Programming",
    currentLevel: 4,
    targetLevel: 5,
    details: "Strong in data structures, but async event loops and coroutines need refinement for agent loops.",
    recommendations: ["Complete Day 15: Concurrency in Python", "Build a multithreaded scraper agent"]
  },
  {
    id: "sg-2",
    name: "Transformers & Attention Math",
    category: "ML/DL",
    currentLevel: 3,
    targetLevel: 5,
    details: "Understands architecture, but mathematical derivations of multi-head self-attention can be improved.",
    recommendations: ["Study deeplearning.ai Attention Mechanisms", "Write self-attention from scratch in PyTorch"]
  },
  {
    id: "sg-3",
    name: "LangGraph Multi-Agent Workflows",
    category: "AI Agents",
    currentLevel: 2,
    targetLevel: 4,
    details: "Familiar with simple chains, but complex cyclic state machines require deeper hands-on prep.",
    recommendations: ["Review LangGraph state reducers documentation", "Build a coder-reviewer cyclic agent system"]
  },
  {
    id: "sg-4",
    name: "Kubernetes & Triton serving",
    category: "MLOps & Deploy",
    currentLevel: 1,
    targetLevel: 4,
    details: "Basic Docker deployment, but serving model checkpoints on Triton with autoscaling is a major gap.",
    recommendations: ["Take the MLOps Deployment Sprint course", "Configure Triton server locally using Llama 3 8B"]
  },
  {
    id: "sg-5",
    name: "Vector Search & Retrieval Optimization",
    category: "System Design",
    currentLevel: 4,
    targetLevel: 5,
    details: "Knows basic Pinecone queries. Needs HNSW indexing tuning and hybrid search logic.",
    recommendations: ["Read Qdrant indexing tuning guide", "Implement reciprocal rank fusion (RRF)"]
  }
];

export const initialInterviewsMock = [
  {
    id: "int-q-1",
    type: "behavioral",
    category: "STAR Behavioral",
    question: "Tell me about a time when you had to deal with a severe model drift or performance degradation in production under tight deadlines. How did you diagnose it and what actions did you take?",
    expectedTokens: ["drift", "monitoring", "baseline", "rollback", "dataset", "star"],
    modelAnswer: "Follow the STAR framework: Describe the Situation (e.g. latency spike/accuracy drop), the Task (restore service), the Action (analyzed data drift, rolled back to baseline checkpoint, ran shadow tests), and the Result (accuracy stabilized, set up drift alerts).",
    starCriteria: "S: Situation (Context) • T: Task (Role/Goal) • A: Action (Specific steps taken) • R: Result (Outcome/Impact metric)"
  },
  {
    id: "int-q-2",
    type: "behavioral",
    category: "STAR Behavioral",
    question: "Describe a scenario where you disagreed with a product manager regarding an LLM trade-off (e.g., accuracy vs latency/cost). How did you align and resolve the conflict?",
    expectedTokens: ["tradeoff", "latency", "cost", "compromise", "evaluation", "metrics"],
    modelAnswer: "STAR: PM wanted larger model for high accuracy; engineer noted cost/latency spike. Action: ran evaluation matrix on prompt engineering, structured outputs, and smaller models. Compromise: utilized routed pipeline (cheap model for simple inputs, heavy model for reasoning inputs). Result: SLA met, cost saved 40%.",
    starCriteria: "S: Context of SLA constraints • T: Cost vs Performance objective • A: Evaluation metrics alignment • R: Compromise solution impact"
  },
  {
    id: "int-q-3",
    type: "technical",
    category: "System Design",
    question: "Design an enterprise-grade RAG pipeline that digests 500,000 PDF documents (many with scanned images and complex tables). How do you handle chunking, indexing, and high-latency queries?",
    expectedTokens: ["ocr", "layout", "semantic chunking", "hnsw", "metadata", "rerank", "cache"],
    modelAnswer: "Use OCR/LayoutLM for text and table extraction. Segment into semantic chunks rather than token bounds. Load embeddings into an HNSW vector index (Qdrant/Pinecone). Apply hybrid search (BM25 + Dense). Filter by metadata tags, then route top 100 to a Cohere Reranker, sending top 5 to prompt context. Implement semantic cache for recurring queries.",
    starCriteria: "Layout Extraction ➔ Semantic Chunking ➔ Hybrid Retrieval ➔ Cohere Rerank ➔ Cache Layer"
  },
  {
    id: "int-q-4",
    type: "technical",
    category: "ML Theory",
    question: "Explain the vanishing gradient problem in deep neural networks, why it happens, and list three distinct techniques to mitigate it.",
    expectedTokens: ["vanishing", "activation", "sigmoid", "relu", "residual", "normalization", "initialization"],
    modelAnswer: "Vanishing gradients occur when multiplying small derivatives recursively in backprop, causing early layer weights to stop updating. Mitigation: 1) Use ReLU/GELU activations instead of Sigmoid. 2) Utilize Residual/Skip connections (ResNet) to bypass gradient multiplication. 3) Apply Batch/Layer Normalization. 4) Use proper weight initialization (He/Xavier).",
    starCriteria: "Definition (Chain Rule limits) ➔ Activation switch ➔ Skip links ➔ Layer Normalization"
  }
];

export const initialTimeline = [
  {
    id: "t-1",
    milestone: "Junior MLE / Software Engineer",
    role: "Core programming and scripts builder",
    duration: "0-2 Years",
    skillsRequired: ["Python Basics", "Git", "SQL Basics", "Supervised Learning"],
    status: "completed"
  },
  {
    id: "t-2",
    milestone: "Mid-level Machine Learning Engineer",
    role: "Feature pipelines, model training and basic API wraps",
    duration: "2-4 Years",
    skillsRequired: ["PyTorch", "FastAPI", "Vector DBs", "Docker", "RAG Patterns"],
    status: "active"
  },
  {
    id: "t-3",
    milestone: "Senior AI Agent Architect",
    role: "Enterprise agent design, graph configurations, evaluations",
    duration: "4-6 Years",
    skillsRequired: ["LangGraph State Machines", "Fine-tuning LLMs", "MLOps", "Security Checkers"],
    status: "active"
  },
  {
    id: "t-4",
    milestone: "Principal AI System Architect",
    role: "Scalable clusters, GPU optimizations, organizational AI roadmap",
    duration: "6+ Years",
    skillsRequired: ["Triton Inference", "vLLM Tuning", "Deep Distributed Training", "SLA Strategy"],
    status: "active"
  }
];

export const initialCompanyRoadmaps = [
  {
    company: "Google DeepMind",
    difficulty: "Extreme",
    focus: "ML Theory, PyTorch/JAX internals, Distributed Training, Research Publications",
    phases: [
      "Phase 1: Deep mathematical algorithms analysis (Calculus, Probability, Linear Algebra)",
      "Phase 2: JAX/PyTorch Custom Layer implementations from scratch",
      "Phase 3: Large-scale training mechanics (Tensor parallelism, pipeline training, flash attention)",
      "Phase 4: Behavioral Alignment interviews (safety principles, alignment research)"
    ]
  },
  {
    company: "OpenAI / Anthropic",
    difficulty: "Extreme",
    focus: "LLM Fine-tuning, RLHF alignment, agent architectures, cost-effective inference serving",
    phases: [
      "Phase 1: Master LoRA, QLoRA, and full conversational tuning pipelines",
      "Phase 2: RLAIF & RLHF mathematical reward functions design",
      "Phase 3: High throughput serving (vLLM, deep attention caching optimizations)",
      "Phase 4: Prompt jailbreaks and guardrails validation test suites"
    ]
  },
  {
    company: "Stripe / Airbnb (Product AI)",
    difficulty: "Hard",
    focus: "Enterprise RAG pipelines, API integrations, relational databases, data pipelines scaling",
    phases: [
      "Phase 1: Advanced SQL queries, schema optimizations, and distributed transactions",
      "Phase 2: Semantic chunk search, metadata filtration, and reranking pipelines",
      "Phase 3: System Design: Scalable rate limiters, load balancers, and queue setups",
      "Phase 4: Product intuition and business metrics alignment rounds"
    ]
  }
];

export const salaryBrackets = {
  "AI Engineer": {
    "Junior": { min: 80000, median: 105000, max: 130000 },
    "Mid-Level": { min: 110000, median: 140000, max: 175000 },
    "Senior": { min: 150000, median: 185000, max: 235000 }
  },
  "Machine Learning Engineer": {
    "Junior": { min: 90000, median: 115000, max: 140000 },
    "Mid-Level": { min: 120000, median: 155000, max: 190000 },
    "Senior": { min: 165000, median: 210000, max: 270000 }
  },
  "MLOps Architect": {
    "Junior": { min: 95000, median: 125000, max: 150000 },
    "Mid-Level": { min: 130000, median: 165000, max: 205000 },
    "Senior": { min: 175000, median: 230000, max: 295000 }
  },
  "AI Architect / Lead": {
    "Junior": { min: 110000, median: 145000, max: 175000 },
    "Mid-Level": { min: 150000, median: 195000, max: 240000 },
    "Senior": { min: 200000, median: 265000, max: 350000 }
  }
};
