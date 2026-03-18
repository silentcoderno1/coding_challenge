import { Response } from "express";
import { HttpStatusCode } from "../constants/http-status-code";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HttpStatusCode.OK,
  message?: string
): void {
  const body: ApiResponse<T> = { success: true, data };
  if (message !== undefined) body.message = message;
  res.status(statusCode).json(body);
}
