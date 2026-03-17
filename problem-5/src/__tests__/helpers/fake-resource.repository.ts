import type { Resource } from "../../entities/Resource.entity";
import { ResourceStatus } from "../../entities/Resource.entity";
import type { CreateResourceDto, UpdateResourceDto } from "../../dtos/resource.dto";
import type {
  IResourceRepository,
  FindAllResourcesQuery,
  FindAllResourcesResult,
} from "../../repositories/resource.repository";

const store = new Map<string, Resource>();
let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `test-uuid-${idCounter}`;
}

function now(): Date {
  return new Date();
}

export class FakeResourceRepository implements IResourceRepository {
  async createResource(data: CreateResourceDto): Promise<Resource> {
    const id = nextId();
    const resource: Resource = {
      id,
      name: data.name,
      description: data.description ?? "",
      status: data.status ?? ResourceStatus.ACTIVE,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    };
    store.set(id, resource);
    return resource;
  }

  async findAll(query: FindAllResourcesQuery): Promise<FindAllResourcesResult> {
    const { status, search, skip = 0, take = 20, sortOrder = "DESC" } = query;
    let items = Array.from(store.values()).filter((r) => r.deletedAt === null);
    if (status) items = items.filter((r) => r.status === status);
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q));
    }
    items.sort((a, b) =>
      sortOrder === "DESC"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime()
    );
    const total = items.length;
    const data = items.slice(skip, skip + take);
    return { data, total };
  }

  async findById(id: string): Promise<Resource | null> {
    const r = store.get(id);
    return r?.deletedAt == null ? r ?? null : null;
  }

  async updateResource(id: string, data: UpdateResourceDto): Promise<Resource | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    if (data.name !== undefined) existing.name = data.name;
    if (data.description !== undefined) existing.description = data.description;
    if (data.status !== undefined) existing.status = data.status;
    existing.updatedAt = now();
    store.set(id, existing);
    return existing;
  }

  async softDeleteResource(id: string): Promise<boolean> {
    const r = store.get(id);
    if (!r || r.deletedAt != null) return false;
    r.deletedAt = now();
    store.set(id, r);
    return true;
  }
}

export function resetFakeResourceStore(): void {
  store.clear();
  idCounter = 0;
}
