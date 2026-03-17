import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors";
import { logger } from "../config/logger";

export interface ErrorResponse {
  success: false;
  message: string;
}

function isDatabaseError(err: Error): boolean {
  const name = err.name ?? "";
  const code = (err as NodeJS.ErrnoException).code ?? "";
  return (
    name === "QueryFailedError" ||
    name === "EntityNotFoundError" ||
    code.startsWith("23") ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response: ErrorResponse = { success: false, message: "" };

  if (err instanceof AppError) {
    logger.warn("Application error", { statusCode: err.statusCode, message: err.message });
    response.message = err.message;
    if (err instanceof ValidationError && err.details) {
      const firstMessages = Object.values(err.details).flat();
      if (firstMessages.length > 0) {
        response.message = `${err.message}: ${firstMessages.slice(0, 3).join("; ")}`;
      }
    }
    res.status(err.statusCode).json(response);
    return;
  }

  if (isDatabaseError(err)) {
    logger.error("Database error", { error: err.message, name: err.name });
    response.message = "A database error occurred. Please try again later.";
    res.status(500).json(response);
    return;
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  response.message = "Internal server error";
  res.status(500).json(response);
}
