import { Request, Response, NextFunction } from "express";
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
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger.log(level, "Request completed", {
      method: req.method,
      url: req.originalUrl ?? req.url,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
