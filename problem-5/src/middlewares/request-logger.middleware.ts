import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/http-status-code";
import { logger } from "../config/logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  logger.info("Request", {
    method: req.method,
    url: req.originalUrl ?? req.url,
    ip: req.ip ?? req.socket.remoteAddress,
  });

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level =
      res.statusCode >= HttpStatusCode.INTERNAL_SERVER_ERROR
        ? "error"
        : res.statusCode >= HttpStatusCode.BAD_REQUEST
          ? "warn"
          : "info";
    logger.log(level, "Request completed", {
      method: req.method,
      url: req.originalUrl ?? req.url,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
