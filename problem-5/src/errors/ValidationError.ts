import { AppError } from "./AppError";

/** Thrown when request validation fails (e.g. class-validator). */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    public readonly details?: Record<string, string[]>
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}
