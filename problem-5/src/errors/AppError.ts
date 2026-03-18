import { HttpStatusCode } from "../constants/http-status-code";

/**
 * Base application error for custom error handling.
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
