export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Resources API",
    description: "CRUD API for Resources with pagination, filtering, and soft delete",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local" },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { type: "object", properties: { status: { type: "string", example: "ok" } } },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/api/v1/resources": {
      get: {
        summary: "List resources",
        tags: ["Resources"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }, description: "Items per page" },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive"] }, description: "Filter by status" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by name (ILIKE)" },
          { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" }, description: "Sort by createdAt" },
        ],
        responses: {
          "200": {
            description: "Paginated list of resources",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data", "meta"],
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Resource" } },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer", example: 42 },
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 20 },
                      },
                    },
                  },
                },
                example: {
                  data: [
                    {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      name: "My Resource",
                      description: "Optional description",
                      status: "active",
                      created_at: "2025-03-17T10:00:00.000Z",
                      updated_at: "2025-03-17T10:00:00.000Z",
                      deleted_at: null,
                    },
                  ],
                  meta: { total: 1, page: 1, limit: 20 },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create resource",
        tags: ["Resources"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateResourceRequest" },
              examples: {
                minimal: {
                  summary: "Minimal (name only)",
                  value: { name: "New Resource" },
                },
                full: {
                  summary: "Full payload",
                  value: {
                    name: "My Resource",
                    description: "Optional description",
                    status: "active",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Resource created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResourceResponse" },
                example: {
                  success: true,
                  data: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "New Resource",
                    description: "",
                    status: "active",
                    created_at: "2025-03-17T10:00:00.000Z",
                    updated_at: "2025-03-17T10:00:00.000Z",
                    deleted_at: null,
                  },
                  message: "Resource created",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Validation failed: name must be at least 3 characters long" },
              },
            },
          },
        },
      },
    },
    "/api/v1/resources/{id}": {
      get: {
        summary: "Get resource by ID",
        tags: ["Resources"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Resource found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResourceResponse" },
                example: {
                  success: true,
                  data: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "My Resource",
                    description: "Description",
                    status: "active",
                    created_at: "2025-03-17T10:00:00.000Z",
                    updated_at: "2025-03-17T10:00:00.000Z",
                    deleted_at: null,
                  },
                },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Resource with id '...' not found" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update resource",
        tags: ["Resources"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateResourceRequest" },
              example: { name: "Updated Name", description: "Updated desc", status: "inactive" },
            },
          },
        },
        responses: {
          "200": {
            description: "Resource updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResourceResponse" },
                example: {
                  success: true,
                  data: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Updated Name",
                    description: "Updated desc",
                    status: "inactive",
                    created_at: "2025-03-17T10:00:00.000Z",
                    updated_at: "2025-03-17T10:05:00.000Z",
                    deleted_at: null,
                  },
                  message: "Resource updated",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete resource (soft delete)",
        tags: ["Resources"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Resource soft-deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object", nullable: true, example: null },
                    message: { type: "string", example: "Resource deleted" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Resource: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          deleted_at: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateResourceRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 3, example: "My Resource" },
          description: { type: "string", example: "Optional description" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      UpdateResourceRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 3 },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      SuccessResourceResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Resource" },
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
} as const;
