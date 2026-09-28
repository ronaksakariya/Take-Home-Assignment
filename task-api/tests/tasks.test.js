const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

beforeEach(() => {
  taskService._reset();
});

describe("POST /tasks", () => {
  it("should create a task", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Learn Supertest",
      description: "Write integration tests",
      priority: "high",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        title: "Learn Supertest",
        description: "Write integration tests",
        priority: "high",
        status: "todo",
        completedAt: null,
      }),
    );

    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it("should reject a task without a title", async () => {
    const response = await request(app).post("/tasks").send({
      description: "No title",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "title is required and must be a non-empty string",
    );
  });

  it("should reject an invalid priority", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Test task",
      priority: "urgent",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "priority must be one of: low, medium, high",
    );
  });
});

describe("GET /tasks", () => {
  it("should return all tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });

    await request(app).post("/tasks").send({ title: "Task 2" });

    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Task 1");
    expect(response.body[1].title).toBe("Task 2");
  });

  it("should return an empty array when there are no tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /tasks?status=...", () => {
  it("should return only tasks with the requested status", async () => {
    await request(app).post("/tasks").send({
      title: "Todo task",
      status: "todo",
    });

    await request(app).post("/tasks").send({
      title: "In progress task",
      status: "in_progress",
    });

    const response = await request(app).get("/tasks?status=todo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Todo task");
    expect(response.body[0].status).toBe("todo");
  });

  it("should return an empty array when no tasks match the status", async () => {
    await request(app).post("/tasks").send({
      title: "Todo task",
      status: "todo",
    });

    const response = await request(app).get("/tasks?status=done");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /tasks?page=...&limit=...", () => {
  beforeEach(async () => {
    for (let i = 1; i <= 12; i++) {
      await request(app)
        .post("/tasks")
        .send({
          title: `Task ${i}`,
        });
    }
  });

  it("should return the first page of tasks", async () => {
    const response = await request(app).get("/tasks?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
    expect(response.body[0].title).toBe("Task 1");
    expect(response.body[9].title).toBe("Task 10");
  });

  it("should return the second page of tasks", async () => {
    const response = await request(app).get("/tasks?page=2&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe("Task 11");
    expect(response.body[1].title).toBe("Task 12");
  });

  it("should return an empty array when the page has no tasks", async () => {
    const response = await request(app).get("/tasks?page=3&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("PUT /tasks/:id", () => {
  it("should update an existing task", async () => {
    const createResponse = await request(app).post("/tasks").send({
      title: "Original title",
      priority: "low",
    });

    const taskId = createResponse.body.id;

    const response = await request(app).put(`/tasks/${taskId}`).send({
      title: "Updated title",
      priority: "high",
    });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated title");
    expect(response.body.priority).toBe("high");
  });

  it("should return 404 when the task does not exist", async () => {
    const response = await request(app).put("/tasks/non-existent-id").send({
      title: "Updated title",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  it("should reject an invalid title", async () => {
    const createResponse = await request(app).post("/tasks").send({
      title: "Original title",
    });

    const taskId = createResponse.body.id;

    const response = await request(app).put(`/tasks/${taskId}`).send({
      title: "   ",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("title must be a non-empty string");
  });
});

describe("DELETE /tasks/:id", () => {
  it("should delete an existing task", async () => {
    const createResponse = await request(app).post("/tasks").send({
      title: "Delete me",
    });

    const taskId = createResponse.body.id;

    const response = await request(app).delete(`/tasks/${taskId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const getResponse = await request(app).get("/tasks");

    expect(getResponse.body).toEqual([]);
  });

  it("should return 404 when the task does not exist", async () => {
    const response = await request(app).delete("/tasks/non-existent-id");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });
});

describe("PATCH /tasks/:id/complete", () => {
  it("should mark a task as complete", async () => {
    const createResponse = await request(app).post("/tasks").send({
      title: "Complete me",
    });

    const taskId = createResponse.body.id;

    const response = await request(app).patch(`/tasks/${taskId}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.completedAt).toBeDefined();
  });

  it("should return 404 when the task does not exist", async () => {
    const response = await request(app).patch(
      "/tasks/non-existent-id/complete",
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  it("should preserve the task priority when completing it", async () => {
    const createResponse = await request(app).post("/tasks").send({
      title: "High priority task",
      priority: "high",
    });

    const taskId = createResponse.body.id;

    const response = await request(app).patch(`/tasks/${taskId}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.priority).toBe("high");
  });
});

describe("GET /tasks/stats", () => {
  it("should return counts by status", async () => {
    await request(app).post("/tasks").send({
      title: "Todo 1",
      status: "todo",
    });

    await request(app).post("/tasks").send({
      title: "Todo 2",
      status: "todo",
    });

    await request(app).post("/tasks").send({
      title: "In progress",
      status: "in_progress",
    });

    await request(app).post("/tasks").send({
      title: "Done",
      status: "done",
    });

    const response = await request(app).get("/tasks/stats");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      todo: 2,
      in_progress: 1,
      done: 1,
      overdue: 0,
    });
  });

  it("should count unfinished overdue tasks", async () => {
    await request(app).post("/tasks").send({
      title: "Overdue task",
      dueDate: "2000-01-01T00:00:00.000Z",
    });

    const response = await request(app).get("/tasks/stats");

    expect(response.status).toBe(200);
    expect(response.body.overdue).toBe(1);
  });

  it("should not count completed overdue tasks", async () => {
    await request(app).post("/tasks").send({
      title: "Overdue completed task",
      dueDate: "2000-01-01T00:00:00.000Z",
      status: "done",
    });

    const response = await request(app).get("/tasks/stats");

    expect(response.status).toBe(200);
    expect(response.body.overdue).toBe(0);
  });

  it("should return zero counts when there are no tasks", async () => {
    const response = await request(app).get("/tasks/stats");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });
});
