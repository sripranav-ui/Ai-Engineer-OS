/**
 * @file filesystemService.js
 * @description Secure Filesystem Abstraction for AI Engineer OS.
 * All filesystem requests pass through authorization, path validation, structured protocol,
 * and the native Local Runtime Daemon / Workspace Guard.
 */

import runtimeClient from "./runtimeClient.js";
import { validateWorkspacePath } from "./runtimeProtocol.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "./runtimeErrors.js";
import runtimeCapabilities from "./runtimeCapabilities.js";

export class FilesystemService {
  /**
   * Validate path safety before issuing runtime client request
   * @private
   */
  _validatePath(path, operation) {
    const workspacePath = runtimeCapabilities.getCapabilities().workspacePath;
    const val = validateWorkspacePath(path, workspacePath);
    if (!val.valid) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.WORKSPACE_VIOLATION,
        val.error,
        operation,
        { path, workspacePath }
      );
    }
    return val.canonicalPath;
  }

  /**
   * Read file content safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<{ success: boolean, content: string, output: string }>}
   */
  async readFile(path, user) {
    this._validatePath(path, "filesystem.read");
    const response = await runtimeClient.readFile(path, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to read file",
        "filesystem.read",
        { path }
      );
    }
    return {
      success: true,
      content: response.data?.result?.content || response.data?.output || "",
      output: response.data?.output || "",
    };
  }

  /**
   * Write file content safely
   * @param {string} path
   * @param {string} content
   * @param {Object} user
   * @returns {Promise<{ success: boolean, output: string }>}
   */
  async writeFile(path, content, user) {
    this._validatePath(path, "filesystem.write");
    const response = await runtimeClient.writeFile(path, content, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to write file",
        "filesystem.write",
        { path }
      );
    }
    return {
      success: true,
      output: response.data?.output || "File written successfully",
    };
  }

  /**
   * List directory contents safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<{ success: boolean, files: Array, output: string }>}
   */
  async listDirectory(path, user) {
    this._validatePath(path, "filesystem.list");
    const response = await runtimeClient.listDirectory(path, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to list directory",
        "filesystem.list",
        { path }
      );
    }
    return {
      success: true,
      files: response.data?.result?.files || [],
      output: response.data?.output || "",
    };
  }

  /**
   * Create directory safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<{ success: boolean, output: string }>}
   */
  async createDirectory(path, user) {
    this._validatePath(path, "filesystem.mkdir");
    const response = await runtimeClient.createDirectory(path, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to create directory",
        "filesystem.mkdir",
        { path }
      );
    }
    return {
      success: true,
      output: response.data?.output || "Directory created successfully",
    };
  }

  /**
   * Delete file safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<{ success: boolean, output: string }>}
   */
  async deleteFile(path, user) {
    this._validatePath(path, "filesystem.delete");
    const response = await runtimeClient.deleteFile(path, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to delete file",
        "filesystem.delete",
        { path }
      );
    }
    return {
      success: true,
      output: response.data?.output || "File deleted successfully",
    };
  }

  /**
   * Check if file exists safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<boolean>}
   */
  async exists(path, user) {
    try {
      this._validatePath(path, "filesystem.exists");
      const response = await runtimeClient.exists(path, user);
      return response.success && Boolean(response.data?.result?.exists);
    } catch {
      return false;
    }
  }

  /**
   * Stat file metadata safely
   * @param {string} path
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async stat(path, user) {
    this._validatePath(path, "filesystem.stat");
    const response = await runtimeClient.stat(path, user);
    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
        response.error?.message || "Failed to stat path",
        "filesystem.stat",
        { path }
      );
    }
    return response.data?.result?.stat || { isFile: true, size: 0 };
  }
}

export const filesystemService = new FilesystemService();
export default filesystemService;
