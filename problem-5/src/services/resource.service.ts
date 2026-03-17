import type { Resource } from "../entities/Resource.entity";
import type { CreateResourceDto, UpdateResourceDto } from "../dtos/resource.dto";
import type {
  IResourceRepository,
  FindAllResourcesQuery,
  FindAllResourcesResult,
} from "../repositories/resource.repository";
import type { IResourceListCache } from "../cache/resource-list.cache";
import { NotFoundError } from "../errors";

export class ResourceService {
  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly listCache: IResourceListCache | null = null
  ) {}

  async createResource(dto: CreateResourceDto): Promise<Resource> {
    const resource = await this.resourceRepository.createResource(dto);
    await this.listCache?.invalidate();
    return resource;
  }

  async getResources(query: FindAllResourcesQuery): Promise<FindAllResourcesResult> {
    const cached = await this.listCache?.get(query);
    if (cached) return cached;
    const result = await this.resourceRepository.findAll(query);
    await this.listCache?.set(query, result);
    return result;
  }

  async getResourceById(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }
    return resource;
  }

  async updateResource(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.resourceRepository.updateResource(id, dto);
    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }
    await this.listCache?.invalidate();
    return resource;
  }

  async deleteResource(id: string): Promise<void> {
    const deleted = await this.resourceRepository.softDeleteResource(id);
    if (!deleted) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }
    await this.listCache?.invalidate();
  }
}
