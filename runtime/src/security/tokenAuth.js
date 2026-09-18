import crypto from "node:crypto";

class TokenAuthManager {
  #sessionToken;

  constructor() {
    this.#sessionToken = `runtime_tok_${crypto.randomBytes(32).toString("hex")}`;
  }

  /**
   * Return masked token representation
   * @returns {string}
   */
  getMaskedToken() {
    return "[REDACTED]";
  }

  /**
   * Token accessor returning masked token
   * @returns {string}
   */
  getToken() {
    return "[REDACTED]";
  }

  /**
   * Constant-time token validation failing closed on invalid input
   * @param {string} candidate
   * @returns {boolean}
   */
  validateToken(candidate) {
    if (!candidate || typeof candidate !== "string") {
      return false;
    }

    const cleanToken = candidate.replace(/^Bearer\s+/i, "").trim();
    if (!cleanToken) {
      return false;
    }

    try {
      const candidateBuffer = Buffer.from(cleanToken, "utf-8");
      const sessionBuffer = Buffer.from(this.#sessionToken, "utf-8");

      if (candidateBuffer.length !== sessionBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(candidateBuffer, sessionBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Helper strictly for automated test suites
   * @returns {string}
   */
  _getRawTokenForTestingOnly() {
    return this.#sessionToken;
  }
}

export const tokenAuth = new TokenAuthManager();
export default tokenAuth;


