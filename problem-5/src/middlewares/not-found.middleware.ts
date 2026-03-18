import { Request, Response } from "express";
import { HttpStatusCode } from "../constants/http-status-code";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(HttpStatusCode.NOT_FOUND).json({ error: "Not found" });
}
