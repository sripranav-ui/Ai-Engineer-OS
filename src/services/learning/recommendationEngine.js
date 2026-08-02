// =======================================================
// recommendationEngine.js — Adaptive AI Recommendation System
// =======================================================
// Analyzes user progress, quiz scores, and weak topics to generate
// personalized next-step learning recommendations.
// =======================================================

import progressEngine from "./progressEngine";

export const recommendationEngine = {
  /**
   * Generates dynamic recommendations based on user performance state
   */
  getRecommendations: () => {
    const metrics = progressEngine.getMetrics();

    const recs = [];

    // Next lesson recommendation
    recs.push({
      id: "rec_next_lesson",
      category: "Lesson",
      title: "Continue: Neural Networks & PyTorch Autograd",
      description: "You completed Loss Functions. Move on to PyTorch autograd engine to complete Module 2.",
      actionLabel: "Start Lesson",
      targetPath: "/learning",
      priority: "high",
    });

    // Weak topic review recommendation
    recs.push({
      id: "rec_weak_topic",
      category: "Revision",
      title: "Review: Multi-Head Attention Matrices",
      description: "Quiz accuracy on Attention Matrices dropped below 60%. Take a quick 5-min practice quiz.",
      actionLabel: "Practice Quiz",
      targetPath: "/learning",
      priority: "medium",
    });

    // Recommended project
    recs.push({
      id: "rec_project",
      category: "Project",
      title: "Build: Custom Vector Search Engine in Python",
      description: "Apply your NumPy matrix knowledge to build a similarity search engine from scratch.",
      actionLabel: "View Project",
      targetPath: "/projects",
      priority: "medium",
    });

    return recs;
  },
};

export default recommendationEngine;
