import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { swaggerDocument } from "./config/swagger";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import { registerRoutes } from "./routes";
import { AppDataSource } from "./config/data-source";
import { getRedis } from "./config/redis";
import { Resource } from "./entities/Resource.entity";
import { ResourceRepository } from "./repositories/resource.repository";
import { ResourceListCache } from "./cache/resource-list.cache";
import { ResourceService } from "./services/resource.service";
import { ResourceController } from "./controllers/resource.controller";
import { createResourceRouter } from "./routes/resource.routes";
import type { IResourceRepository } from "./repositories/resource.repository";
import type { IResourceListCache } from "./cache/resource-list.cache";

export interface CreateAppOptions {
  repository?: IResourceRepository;
  cache?: IResourceListCache | null;
}

export function createApp(options?: CreateAppOptions): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(requestLogger);
  app.use(morgan(env.LOG_LEVEL === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument as Parameters<typeof swaggerUi.setup>[0]));

  const resourceRepository =
    options?.repository ??
    new ResourceRepository(AppDataSource.getRepository(Resource));
  const resourceListCache =
    options?.cache !== undefined
      ? options.cache
      : new ResourceListCache(getRedis());
  const resourceService = new ResourceService(resourceRepository, resourceListCache);
  const resourceController = new ResourceController(resourceService);
  const resourceRouter = createResourceRouter(resourceController);

  registerRoutes(app, resourceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
