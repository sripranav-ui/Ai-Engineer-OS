import crypto from "node:crypto";

class TokenAuthManager {
  #sessionToken;

  constructor() {
    this.#sessionToken = `runtime_tok_${crypto.randomBytes(32).toString("hex")}`;
  }

  /**
   * Masked token accessor to ensure tokens are never leaked
   * @returns {string}
   */
  getMaskedToken() {
    return "[REDACTED]";
  }

  /**
   * Returns redacted token indicator for health metadata
   * @returns {string}
   */
  getToken() {
    return "[REDACTED]";
  }

  /**
   * Constant-time token comparison to prevent timing attacks
   * @param {string} reqToken
   * @returns {boolean}
   */
  validateToken(reqToken) {
    if (!reqToken || typeof reqToken !== "string") {
      return false;
    }

    const cleanToken = reqToken.replace(/^Bearer\s+/i, "").trim();
    if (!cleanToken) {
      return false;
    }

    const tokenBuffer = Buffer.from(cleanToken);
    const sessionBuffer = Buffer.from(this.#sessionToken);

    if (tokenBuffer.length !== sessionBuffer.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(tokenBuffer, sessionBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Raw token accessor strictly for test harnesses or explicit authentication callers
   * @returns {string}
   */
  _getRawTokenForTestingOnly() {
    return this.#sessionToken;
  }
}

export const tokenAuth = new TokenAuthManager();
export default tokenAuth;

