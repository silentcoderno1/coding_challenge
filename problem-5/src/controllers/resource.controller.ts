import { Request, Response } from "express";
import type { ResourceService } from "../services/resource.service";
import type { CreateResourceDto, UpdateResourceDto } from "../dtos/resource.dto";
import type { FindAllResourcesQuery } from "../repositories/resource.repository";
import { ResourceStatus } from "../entities/Resource.entity";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as CreateResourceDto;
    const resource = await this.resourceService.createResource(dto);
    sendSuccess(res, resource, 201, "Resource created");
  });

  getResources = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, string | undefined>;
    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10) || 20));
    const skip = (page - 1) * limit;

    const params: FindAllResourcesQuery = {
      skip,
      take: limit,
    };
    if (query.status === ResourceStatus.ACTIVE || query.status === ResourceStatus.INACTIVE)
      params.status = query.status as ResourceStatus;
    if (query.search !== undefined && query.search.trim() !== "")
      params.search = query.search.trim();
    const sortOrder = query.sort?.toLowerCase() === "asc" ? "ASC" : "DESC";
    params.sortOrder = sortOrder;

    const { data, total } = await this.resourceService.getResources(params);
    res.status(200).json({
      data,
      meta: { total, page, limit },
    });
  });

  getResourceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const resource = await this.resourceService.getResourceById(id);
    sendSuccess(res, resource);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const dto = req.body as UpdateResourceDto;
    const resource = await this.resourceService.updateResource(id, dto);
    sendSuccess(res, resource, 200, "Resource updated");
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await this.resourceService.deleteResource(id);
    sendSuccess(res, null, 200, "Resource deleted");
  });
}
