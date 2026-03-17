import { AppError } from "./AppError";

/** Thrown when a requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, 404, code ?? "NOT_FOUND");
  }
}
