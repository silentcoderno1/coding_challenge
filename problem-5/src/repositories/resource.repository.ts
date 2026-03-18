import { Repository } from "typeorm";
import { Resource, ResourceStatus } from "../entities/Resource.entity";
import type { CreateResourceDto, UpdateResourceDto } from "../dtos/resource.dto";

export type SortOrder = "ASC" | "DESC";

export interface FindAllResourcesQuery {
  status?: ResourceStatus;
  search?: string;
  skip?: number;
  take?: number;
  sortOrder?: SortOrder;
}

export interface FindAllResourcesResult {
  data: Resource[];
  total: number;
}

export interface IResourceRepository {
  createResource(data: CreateResourceDto): Promise<Resource>;
  findAll(query: FindAllResourcesQuery): Promise<FindAllResourcesResult>;
  findById(id: string): Promise<Resource | null>;
  updateResource(id: string, data: UpdateResourceDto): Promise<Resource | null>;
  softDeleteResource(id: string): Promise<boolean>;
}

export class ResourceRepository implements IResourceRepository {
  constructor(private readonly repo: Repository<Resource>) {}

  async createResource(data: CreateResourceDto): Promise<Resource> {
    const resource = this.repo.create({
      name: data.name,
      description: data.description ?? "",
      status: data.status ?? ResourceStatus.ACTIVE,
    });
    return this.repo.save(resource);
  }

  async findAll(queryParams: FindAllResourcesQuery): Promise<FindAllResourcesResult> {
    const { status, search, skip = 0, take = 20, sortOrder = "DESC" } = queryParams;

    const qb = this.repo
      .createQueryBuilder("resource")
      .where("resource.deleted_at IS NULL");

    if (status !== undefined && status !== null) {
      qb.andWhere("resource.status = :status", { status });
    }
    if (search !== undefined && search.trim() !== "") {
      // SQLite: case-insensitive search (ILIKE is PostgreSQL-only)
      qb.andWhere("LOWER(resource.name) LIKE LOWER(:search)", {
        search: `%${search.trim()}%`,
      });
    }
    qb.orderBy("resource.created_at", sortOrder).skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(id: string): Promise<Resource | null> {
    const resource = await this.repo
      .createQueryBuilder("resource")
      .where("resource.id = :id", { id })
      .andWhere("resource.deleted_at IS NULL")
      .getOne();
    return resource ?? null;
  }

  async findByIdWithDeleted(id: string): Promise<Resource | null> {
    const resource = await this.repo
      .createQueryBuilder("resource")
      .withDeleted()
      .where("resource.id = :id", { id })
      .getOne();
    return resource ?? null;
  }

  async updateResource(id: string, data: UpdateResourceDto): Promise<Resource | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    if (data.name !== undefined) existing.name = data.name;
    if (data.description !== undefined) existing.description = data.description;
    if (data.status !== undefined) existing.status = data.status;
    return this.repo.save(existing);
  }

  async softDeleteResource(id: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .softDelete()
      .from(Resource)
      .where("id = :id", { id })
      .andWhere("deleted_at IS NULL")
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
