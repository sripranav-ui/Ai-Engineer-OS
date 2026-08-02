/**
 * @file relationshipBuilder.js
 * @description Graph relationship edge builder for connecting Knowledge Graph nodes.
 */

export const RELATIONSHIP_TYPES = {
  BELONGS_TO:   "belongs_to",
  DEPENDS_ON:   "depends_on",
  GENERATED_BY: "generated_by",
  REFERENCES:   "references",
  CONTAINS:     "contains",
  RELATED_TO:   "related_to",
  CREATED_FROM: "created_from",
  USED_BY:      "used_by",
  SPAWNED:      "spawned",
  IMPLEMENTS:   "implements",
  EXTENDS:      "extends",
  BLOCKED_BY:   "blocked_by",
  ASSIGNED_TO:  "assigned_to",
  SUMMARIZES:   "summarizes",
};

export const relationshipBuilder = {
  /**
   * Creates a directed relationship edge object.
   * @param {string} sourceId
   * @param {string} targetId
   * @param {string} type - Member of RELATIONSHIP_TYPES
   * @param {Object} [metadata={}]
   * @returns {Object} Edge shape
   */
  createEdge: (sourceId, targetId, type, metadata = {}) => ({
    id: `edge_${sourceId}_${type}_${targetId}`,
    source: sourceId,
    target: targetId,
    type,
    metadata,
    createdAt: new Date().toISOString(),
  }),
};

export default relationshipBuilder;
