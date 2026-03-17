import { Router } from "express";
import type { ResourceController } from "../controllers/resource.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { CreateResourceDto, UpdateResourceDto } from "../dtos/resource.dto";

export function createResourceRouter(controller: ResourceController): Router {
  const router = Router();

  router.post("/", validateBody(CreateResourceDto), controller.create);
  router.get("/", controller.getResources);
  router.get("/:id", controller.getResourceById);
  router.put("/:id", validateBody(UpdateResourceDto), controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
