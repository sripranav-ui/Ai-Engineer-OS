/**
 * @file documentParser.js
 * @description Multi-Format Local Document Parser for AI Engineer OS RAG Engine.
 * Extracts text and metadata from TXT, Markdown (.md), PDF, and DOCX files.
 * Detects page counts, ignores empty pages, identifies corrupted files, and computes
 * deterministic content hashes for embedding caching.
 *
 * Public API:
 * - parseFile(file: File): Promise<{ title: string, text: string, type: string, pageCount: number, contentHash: string, error?: string }>
 * - computeContentHash(text: string): string
 */

import embeddingService from "./embeddingService.js";
import ragLogger from "./ragLogger.js";

export class DocumentParser {
  /**
   * Compute deterministic content hash for any string
   * @param {string} text
   * @returns {string}
   */
  computeContentHash(text = "") {
    return embeddingService.computeContentHash(text);
  }

  /**
   * Parse uploaded File object and return structured payload
   * @param {File} file
   * @returns {Promise<{ title: string, text: string, type: string, pageCount: number, contentHash: string, error?: string }>}
   */
  async parseFile(file) {
    if (!file) {
      return {
        title: "Unknown Document",
        text: "",
        type: "unknown",
        pageCount: 0,
        contentHash: "empty_0",
        error: "No file provided to parser",
      };
    }

    const title = file.name || "Untitled Document";
    const rawExtension = title.includes(".") ? title.substring(title.lastIndexOf(".")).toLowerCase() : "";
    const type = rawExtension.replace(".", "") || "txt";

    try {
      // Validate empty file size
      if (file.size === 0) {
        return {
          title,
          text: "",
          type,
          pageCount: 0,
          contentHash: "empty_0",
          error: "File is empty (0 bytes)",
        };
      }

      let parsedResult;

      switch (rawExtension) {
        case ".pdf":
          parsedResult = await this.parsePdf(file);
          break;
        case ".docx":
        case ".doc":
          parsedResult = await this.parseDocx(file);
          break;
        case ".md":
        case ".markdown":
          parsedResult = await this.parseMarkdown(file);
          break;
        case ".txt":
        case ".json":
        case ".csv":
        default:
          parsedResult = await this.parseTxt(file);
          break;
      }

      if (parsedResult.error) {
        return {
          title,
          text: "",
          type,
          pageCount: 0,
          contentHash: `error_${this.computeContentHash(parsedResult.error)}`,
          error: parsedResult.error,
        };
      }

      const text = (parsedResult.text || "").trim();
      if (!text) {
        return {
          title,
          text: "",
          type,
          pageCount: 0,
          contentHash: "empty_0",
          error: "File contains no readable text content",
        };
      }

      const contentHash = this.computeContentHash(text);
      const pageCount = parsedResult.pageCount || Math.max(1, Math.ceil(text.length / 2000));

      return {
        title,
        text,
        type,
        pageCount,
        contentHash,
      };
    } catch (err) {
      ragLogger.error(`Failed to parse file "${title}":`, err);
      return {
        title,
        text: "",
        type,
        pageCount: 0,
        contentHash: `error_${Date.now()}`,
        error: `Parsing failed: ${err.message || "Unknown error"}`,
      };
    }
  }

  /** Parse Plain Text Files */
  async parseTxt(file) {
    try {
      const rawText = await file.text();
      const cleanText = rawText.replace(/\r\n/g, "\n").trim();
      if (!cleanText) {
        return { text: "", pageCount: 0, error: "Empty text file" };
      }

      // Count non-empty pages separated by form feed '\f'
      const pageBlocks = cleanText.split(/\f+/).filter((p) => p.trim().length > 0);
      const pageCount = pageBlocks.length > 1 ? pageBlocks.length : Math.max(1, Math.ceil(cleanText.length / 2000));

      return { text: cleanText, pageCount };
    } catch (err) {
      return { text: "", pageCount: 0, error: `Failed to read text file: ${err.message}` };
    }
  }

  /** Parse Markdown (.md) Files */
  async parseMarkdown(file) {
    try {
      const rawText = await file.text();
      const cleanText = rawText.replace(/\r\n/g, "\n").trim();
      if (!cleanText) {
        return { text: "", pageCount: 0, error: "Empty markdown file" };
      }

      // Ignore empty markdown sections or horizontal rule dividers
      const sections = cleanText
        .split(/(?:^|\n)(?:---|\*\*\*|___)(?:\n|$)/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const pageCount = sections.length > 1 ? sections.length : Math.max(1, Math.ceil(cleanText.length / 2000));

      return { text: cleanText, pageCount };
    } catch (err) {
      return { text: "", pageCount: 0, error: `Failed to read markdown file: ${err.message}` };
    }
  }

  /** Extract text and page count from PDF ArrayBuffer */
  async parsePdf(file) {
    try {
      const buffer = await file.arrayBuffer();
      if (!buffer || buffer.byteLength < 8) {
        return { text: "", pageCount: 0, error: "Corrupted PDF: file is too small or invalid" };
      }

      const bytes = new Uint8Array(buffer);
      const rawString = new TextDecoder("latin1").decode(bytes);

      // Validate PDF Header signature %PDF-
      if (!rawString.startsWith("%PDF-") && !rawString.includes("%PDF-")) {
        return { text: "", pageCount: 0, error: "Corrupted PDF: Missing %PDF- header signature" };
      }

      // Detect PDF pages by counting '/Type /Page' or '/Type/Page' instances
      const pageMatches = rawString.match(/\/Type\s*\/Page\b/g) || [];
      let detectedPageCount = pageMatches.length;

      // Extract text enclosed in PDF stream parenthesis brackets
      const textMatches = rawString.match(/\(([^()]{2,})\)/g) || [];
      const pageSegments = [];

      for (const m of textMatches) {
        const str = m.slice(1, -1).trim();
        // Ignore empty pages/watermarks and binary noise
        if (str.length > 2 && /[a-zA-Z0-9\s.,?!:;\-_]/.test(str)) {
          pageSegments.push(str);
        }
      }

      let extractedText = pageSegments.join(" ");

      // Fallback text cleaner if bracket parsing yielded little text
      if (extractedText.trim().length < 30) {
        extractedText = rawString
          .replace(/[^\x20-\x7E\n\r]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      // Remove PDF syntax control lines if present
      extractedText = extractedText
        .replace(/endobj|stream|endstream|obj|xref|trailer|startxref/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!extractedText) {
        return { text: "", pageCount: 0, error: "Corrupted PDF: No readable text stream found" };
      }

      const pageCount = detectedPageCount > 0 ? detectedPageCount : Math.max(1, Math.ceil(extractedText.length / 2000));

      return { text: extractedText, pageCount };
    } catch (err) {
      ragLogger.error("PDF parsing error:", err);
      return { text: "", pageCount: 0, error: `Corrupted or unreadable PDF: ${err.message}` };
    }
  }

  /** Extract text from DOCX XML stream */
  async parseDocx(file) {
    try {
      const buffer = await file.arrayBuffer();
      if (!buffer || buffer.byteLength < 30) {
        return { text: "", pageCount: 0, error: "Corrupted DOCX: file is too small or invalid" };
      }

      const bytes = new Uint8Array(buffer);
      // Validate PK Zip signature (50 4B 03 04)
      if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return { text: "", pageCount: 0, error: "Corrupted DOCX: Missing valid PK zip header" };
      }

      const rawString = new TextDecoder("utf-8").decode(bytes);

      // Extract text content from Word XML tags <w:t> or <w:p>
      const paragraphMatches = rawString.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const extractedParagraphs = paragraphMatches
        .map((p) => p.replace(/<[^>]+>/g, "").trim())
        .filter((text) => text.length > 0);

      let cleanText = extractedParagraphs.join("\n\n");

      if (!cleanText) {
        // Fallback XML tag cleaner
        cleanText = rawString
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      if (!cleanText) {
        return { text: "", pageCount: 0, error: "Corrupted DOCX: No readable text elements found" };
      }

      // Count page breaks (<w:br w:type="page"/>)
      const pageBreakMatches = rawString.match(/<w:br[^>]+type="page"/g) || [];
      const pageCount = pageBreakMatches.length > 0 ? pageBreakMatches.length + 1 : Math.max(1, Math.ceil(cleanText.length / 2000));

      return { text: cleanText, pageCount };
    } catch (err) {
      ragLogger.error("DOCX parsing error:", err);
      return { text: "", pageCount: 0, error: `Corrupted or unreadable DOCX: ${err.message}` };
    }
  }
}

export const documentParser = new DocumentParser();
export default documentParser;
