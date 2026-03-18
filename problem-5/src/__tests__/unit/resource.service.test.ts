import { ResourceService } from "../../services/resource.service";
import { NotFoundError } from "../../errors";
import type { Resource } from "../../entities/Resource.entity";
import { ResourceStatus } from "../../entities/Resource.entity";
import type { FindAllResourcesQuery, FindAllResourcesResult } from "../../repositories/resource.repository";

describe("ResourceService", () => {
  const mockResource: Resource = {
    id: "uuid-1",
    name: "Test Resource",
    description: "Desc",
    status: ResourceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockFindAllResult: FindAllResourcesResult = {
    data: [mockResource],
    total: 1,
  };

  const mockRepository = {
    createResource: jest.fn().mockResolvedValue(mockResource),
    findAll: jest.fn().mockResolvedValue(mockFindAllResult),
    findById: jest.fn().mockResolvedValue(mockResource),
    updateResource: jest.fn().mockResolvedValue(mockResource),
    softDeleteResource: jest.fn().mockResolvedValue(true),
  };

  const mockCache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
  };

  let service: ResourceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResourceService(mockRepository as never, mockCache as never);
  });

  describe("createResource", () => {
    it("creates resource and invalidates cache", async () => {
      const dto = { name: "New", description: "D" };
      const result = await service.createResource(dto);
      expect(mockRepository.createResource).toHaveBeenCalledWith(dto);
      expect(mockCache.invalidate).toHaveBeenCalled();
      expect(result).toEqual(mockResource);
    });
  });

  describe("getResources", () => {
    it("returns from cache when hit", async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(mockFindAllResult);
      const query: FindAllResourcesQuery = { skip: 0, take: 20 };
      const result = await service.getResources(query);
      expect(mockCache.get).toHaveBeenCalledWith(query);
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(mockFindAllResult);
    });

    it("fetches from repository and sets cache on miss", async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      const query: FindAllResourcesQuery = { skip: 0, take: 20 };
      const result = await service.getResources(query);
      expect(mockCache.get).toHaveBeenCalledWith(query);
      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(mockCache.set).toHaveBeenCalledWith(query, mockFindAllResult);
      expect(result).toEqual(mockFindAllResult);
    });
  });

  describe("getResourceById", () => {
    it("returns resource when found", async () => {
      const result = await service.getResourceById("uuid-1");
      expect(mockRepository.findById).toHaveBeenCalledWith("uuid-1");
      expect(result).toEqual(mockResource);
    });

    it("throws NotFoundError when not found", async () => {
      (mockRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getResourceById("missing")).rejects.toThrow(NotFoundError);
      await expect(service.getResourceById("missing")).rejects.toThrow(
        "Resource with id 'missing' not found"
      );
    });
  });

  describe("updateResource", () => {
    it("updates and invalidates cache", async () => {
      const dto = { name: "Updated" };
      const result = await service.updateResource("uuid-1", dto);
      expect(mockRepository.updateResource).toHaveBeenCalledWith("uuid-1", dto);
      expect(mockCache.invalidate).toHaveBeenCalled();
      expect(result).toEqual(mockResource);
      // expect(result).toEqual({});
    });

    it("throws NotFoundError when repository returns null", async () => {
      (mockRepository.updateResource as jest.Mock).mockResolvedValue(null);
      await expect(service.updateResource("missing", { name: "X" })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("deleteResource", () => {
    it("soft deletes and invalidates cache", async () => {
      await service.deleteResource("uuid-1");
      expect(mockRepository.softDeleteResource).toHaveBeenCalledWith("uuid-1");
      expect(mockCache.invalidate).toHaveBeenCalled();
    });

    it("throws NotFoundError when not deleted", async () => {
      (mockRepository.softDeleteResource as jest.Mock).mockResolvedValue(false);
      await expect(service.deleteResource("missing")).rejects.toThrow(NotFoundError);
    });
  });
});
