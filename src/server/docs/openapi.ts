import { env } from "@/lib/env";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Scalable Tasks REST API",
    version: "1.0.0",
    description:
      "REST API with JWT authentication, role-based access control, task CRUD, Redis caching, and structured error handling.",
  },
  servers: [
    {
      url: env.API_BASE_URL,
      description: "Current environment",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Tasks" },
    { name: "Admin" },
    { name: "System" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Alex Carter" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", example: "Str0ng@Pass" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      TaskInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Prepare release notes" },
          description: { type: "string", example: "Summarize sprint progress" },
          status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "DONE"],
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": { description: "API healthy" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "409": { description: "Email already in use" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": { description: "Logged in" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        responses: {
          "200": { description: "Token refreshed" },
          "401": { description: "Invalid refresh token" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current authenticated user" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Task list" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "201": { description: "Task created" },
        },
      },
    },
    "/api/v1/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary: "Update task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "200": { description: "Task updated" },
          "404": { description: "Task not found" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Task deleted" },
        },
      },
    },
    "/api/v1/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users list" },
          "403": { description: "Forbidden" },
        },
      },
    },
  },
} as const;
