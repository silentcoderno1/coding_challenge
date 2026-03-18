import { HttpStatusCode } from "../constants/http-status-code";
import { AppError } from "./AppError";

/** Thrown when a requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, HttpStatusCode.NOT_FOUND, code ?? "NOT_FOUND");
  }
}
