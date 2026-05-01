import { getEnv } from "@/lib/env";
const env = getEnv();

export const postmanCollection = {
  info: {
    name: "Scalable REST API - v1",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    {
      key: "baseUrl",
      value: env.API_BASE_URL,
    },
    {
      key: "accessToken",
      value: "",
    },
    {
      key: "taskId",
      value: "",
    },
  ],
  item: [
    {
      name: "Health",
      request: {
        method: "GET",
        url: "{{baseUrl}}/api/v1/health",
      },
    },
    {
      name: "Register",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              name: "Admin User",
              email: "admin@example.com",
              password: "Admin@1234",
            },
            null,
            2
          ),
        },
        url: "{{baseUrl}}/api/v1/auth/register",
      },
    },
    {
      name: "Login",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              email: "admin@example.com",
              password: "Admin@1234",
            },
            null,
            2
          ),
        },
        url: "{{baseUrl}}/api/v1/auth/login",
      },
    },
    {
      name: "Me",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
        url: "{{baseUrl}}/api/v1/auth/me",
      },
    },
    {
      name: "Create Task",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "Bearer {{accessToken}}" },
          { key: "Content-Type", value: "application/json" },
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              title: "First task",
              description: "Initial seeded task",
              status: "TODO",
            },
            null,
            2
          ),
        },
        url: "{{baseUrl}}/api/v1/tasks",
      },
    },
    {
      name: "List Tasks",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
        url: "{{baseUrl}}/api/v1/tasks",
      },
    },
    {
      name: "Update Task",
      request: {
        method: "PUT",
        header: [
          { key: "Authorization", value: "Bearer {{accessToken}}" },
          { key: "Content-Type", value: "application/json" },
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              title: "Updated task title",
              status: "IN_PROGRESS",
            },
            null,
            2
          ),
        },
        url: "{{baseUrl}}/api/v1/tasks/{{taskId}}",
      },
    },
    {
      name: "Delete Task",
      request: {
        method: "DELETE",
        header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
        url: "{{baseUrl}}/api/v1/tasks/{{taskId}}",
      },
    },
    {
      name: "Admin Users",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
        url: "{{baseUrl}}/api/v1/admin/users",
      },
    },
  ],
} as const;
