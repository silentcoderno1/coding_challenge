import { HttpStatusCode } from "../constants/http-status-code";
import { AppError } from "./AppError";

/** Thrown when request validation fails (e.g. class-validator). */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    public readonly details?: Record<string, string[]>
  ) {
    super(message, HttpStatusCode.BAD_REQUEST, "VALIDATION_ERROR");
  }
}
