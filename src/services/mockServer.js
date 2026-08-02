import logger from "../utils/logger";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { LessonRepository } from "../repositories/LessonRepository";
import { PlannerRepository } from "../repositories/PlannerRepository";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";

/**
 * Local Mock Server Router
 * Intercepts calls from apiClient and forwards them directly to the Namespaced Repository Layer.
 */
export const mockServer = {
  handleRequest: async (endpoint, method, body, headers) => {
    logger.info(`[Mock Server] Intercepting request: ${method} ${endpoint}`);

    // Extract workspace parameter if present in headers or path query (mocked)
    const workspaceId = "default"; 

    // Router Maps
    if (endpoint.startsWith("/api/projects")) {
      if (method === "GET") {
        const data = await ProjectRepository.getProjects(workspaceId);
        return { ok: true, status: 200, data };
      }
      if (method === "POST") {
        const payload = JSON.parse(body);
        const data = await ProjectRepository.saveProjects(payload, workspaceId);
        return { ok: true, status: 201, data };
      }
    }

    if (endpoint.startsWith("/api/lessons")) {
      if (method === "GET") {
        // Fetch recommendations diagnostic indices
        const recs = await LessonRepository.getAIRecommendations(workspaceId);
        const path = await LessonRepository.getLessonPath(workspaceId);
        return { ok: true, status: 200, data: { recommendations: recs, lessonPath: path } };
      }
    }

    if (endpoint.startsWith("/api/planner")) {
      if (method === "GET") {
        const data = await PlannerRepository.getScheduleList(workspaceId);
        return { ok: true, status: 200, data };
      }
      if (method === "POST") {
        const payload = JSON.parse(body);
        const data = await PlannerRepository.saveScheduleList(payload, workspaceId);
        return { ok: true, status: 200, data };
      }
    }

    if (endpoint.startsWith("/api/analytics")) {
      if (method === "GET") {
        const data = await AnalyticsRepository.getPeriodicReports(workspaceId);
        return { ok: true, status: 200, data };
      }
    }

    // Default 404 Fallback
    return {
      ok: false,
      status: 404,
      statusText: `Endpoint ${method} ${endpoint} not mapped in Mock Server Router.`
    };
  }
};

export default mockServer;
