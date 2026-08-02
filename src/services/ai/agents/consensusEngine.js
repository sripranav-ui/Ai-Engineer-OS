/**
 * @file consensusEngine.js
 * @description Consensus solver resolving multi-agent conflicts via majority vote or supervisor choice.
 */

import logger from "../../../utils/logger.js";

export const consensusEngine = {
  /**
   * Resolves consensus among agent proposals.
   * @param {Object[]} proposals - ({ agentId, proposal, confidence })
   * @returns {Object} Winning proposal
   */
  resolveConsensus: (proposals = []) => {
    if (!proposals || proposals.length === 0) return null;
    logger.info(`[ConsensusEngine] Resolving consensus across ${proposals.length} proposal(s)...`);

    // Sort by confidence weight
    const sorted = [...proposals].sort((a, b) => (b.confidence || 50) - (a.confidence || 50));
    return sorted[0];
  },
};

export default consensusEngine;
