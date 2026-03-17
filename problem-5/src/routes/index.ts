import { Express } from "express";
import type { Router } from "express";

export function registerRoutes(app: Express, resourceRouter: Router): void {
  app.use("/api/v1/resources", resourceRouter);
}
