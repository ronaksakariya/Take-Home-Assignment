const taskService = require("../src/services/taskService");

describe("taskService", () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe("create", () => {
    it("should create a task with the correct defaults", () => {
      const task = taskService.create({
        title: "Learn Jest",
      });

      expect(task).toEqual(
        expect.objectContaining({
          title: "Learn Jest",
          description: "",
          status: "todo",
          priority: "medium",
          dueDate: null,
          completedAt: null,
        }),
      );

      expect(task.id).toBeDefined();
      expect(typeof task.id).toBe("string");

      expect(task.createdAt).toBeDefined();
      expect(typeof task.createdAt).toBe("string");
      expect(new Date(task.createdAt).toString()).not.toBe("Invalid Date");
    });

    it("should create a task with provided values", () => {
      const task = taskService.create({
        title: "Finish assignment",
        description: "Write tests",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-10-01T00:00:00.000Z",
      });

      expect(task.title).toBe("Finish assignment");
      expect(task.description).toBe("Write tests");
      expect(task.status).toBe("in_progress");
      expect(task.priority).toBe("high");
      expect(task.dueDate).toBe("2026-10-01T00:00:00.000Z");
      expect(task.completedAt).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all tasks", () => {
      taskService.create({ title: "Task 1" });
      taskService.create({ title: "Task 2" });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks.map((task) => task.title)).toEqual(["Task 1", "Task 2"]);
    });

    it("should return an empty array when there are no tasks", () => {
      expect(taskService.getAll()).toEqual([]);
    });

    it("should return a copy of the tasks array", () => {
      taskService.create({ title: "Task 1" });

      const tasks = taskService.getAll();

      tasks.pop();

      expect(taskService.getAll()).toHaveLength(1);
    });
  });

  describe("findById", () => {
    it("should return the task when the ID exists", () => {
      const createdTask = taskService.create({
        title: "Find me",
      });

      const foundTask = taskService.findById(createdTask.id);

      expect(foundTask).toEqual(createdTask);
    });

    it("should return undefined when the ID does not exist", () => {
      expect(taskService.findById("non-existent-id")).toBeUndefined();
    });
  });

  describe("getByStatus", () => {
    it("should return only tasks matching the requested status", () => {
      taskService.create({
        title: "Todo task",
        status: "todo",
      });

      taskService.create({
        title: "Progress task",
        status: "in_progress",
      });

      taskService.create({
        title: "Done task",
        status: "done",
      });

      const tasks = taskService.getByStatus("todo");

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Todo task");
      expect(tasks[0].status).toBe("todo");
    });

    it("should return an empty array when no tasks match", () => {
      taskService.create({
        title: "Todo task",
        status: "todo",
      });

      expect(taskService.getByStatus("done")).toEqual([]);
    });
  });

  describe("getPaginated", () => {
    it("should return the first page of tasks", () => {
      for (let i = 1; i <= 12; i++) {
        taskService.create({
          title: `Task ${i}`,
        });
      }

      const tasks = taskService.getPaginated(1, 10);

      expect(tasks).toHaveLength(10);
      expect(tasks[0].title).toBe("Task 1");
      expect(tasks[9].title).toBe("Task 10");
    });

    it("should return the second page of tasks", () => {
      for (let i = 1; i <= 12; i++) {
        taskService.create({
          title: `Task ${i}`,
        });
      }

      const tasks = taskService.getPaginated(2, 10);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Task 11");
      expect(tasks[1].title).toBe("Task 12");
    });

    it("should return an empty array when the page has no tasks", () => {
      taskService.create({
        title: "Task 1",
      });

      expect(taskService.getPaginated(2, 10)).toEqual([]);
    });
  });

  describe("getStats", () => {
    it("should return counts for each status", () => {
      taskService.create({ title: "Task 1", status: "todo" });
      taskService.create({ title: "Task 2", status: "todo" });
      taskService.create({ title: "Task 3", status: "in_progress" });
      taskService.create({ title: "Task 4", status: "done" });

      const stats = taskService.getStats();

      expect(stats).toEqual({
        todo: 2,
        in_progress: 1,
        done: 1,
        overdue: 0,
      });
    });

    it("should count unfinished overdue tasks", () => {
      taskService.create({
        title: "Overdue task",
        dueDate: "2000-01-01T00:00:00.000Z",
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });

    it("should not count completed tasks as overdue", () => {
      const task = taskService.create({
        title: "Completed overdue task",
        dueDate: "2000-01-01T00:00:00.000Z",
        status: "done",
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(0);
    });

    it("should return zero counts when there are no tasks", () => {
      expect(taskService.getStats()).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });
  });

  describe("update", () => {
    it("should update an existing task", () => {
      const task = taskService.create({
        title: "Original title",
        priority: "low",
      });

      const updated = taskService.update(task.id, {
        title: "Updated title",
        priority: "high",
      });

      expect(updated.title).toBe("Updated title");
      expect(updated.priority).toBe("high");
    });

    it("should preserve fields that are not updated", () => {
      const task = taskService.create({
        title: "Original title",
        description: "Original description",
        priority: "high",
      });

      const updated = taskService.update(task.id, {
        title: "Updated title",
      });

      expect(updated.title).toBe("Updated title");
      expect(updated.description).toBe("Original description");
      expect(updated.priority).toBe("high");
    });

    it("should return null when the task does not exist", () => {
      const updated = taskService.update("non-existent-id", {
        title: "Updated",
      });

      expect(updated).toBeNull();
    });
  });

  describe("remove", () => {
    it("should remove an existing task", () => {
      const task = taskService.create({
        title: "Delete me",
      });

      const result = taskService.remove(task.id);

      expect(result).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    it("should return false when the task does not exist", () => {
      expect(taskService.remove("non-existent-id")).toBe(false);
    });
  });

  describe("completeTask", () => {
    it("should mark a task as done", () => {
      const task = taskService.create({
        title: "Complete me",
        priority: "high",
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe("done");
    });

    it("should set completedAt when completing a task", () => {
      const task = taskService.create({
        title: "Complete me",
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.completedAt).toBeDefined();
      expect(typeof completed.completedAt).toBe("string");
      expect(new Date(completed.completedAt).toString()).not.toBe(
        "Invalid Date",
      );
    });

    it("should preserve the task priority when completing it", () => {
      const task = taskService.create({
        title: "High priority task",
        priority: "high",
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.priority).toBe("high");
    });

    it("should return null when the task does not exist", () => {
      expect(taskService.completeTask("non-existent-id")).toBeNull();
    });
  });

  it("should preserve other task fields when completing it", () => {
    const task = taskService.create({
      title: "Important task",
      description: "Some description",
      priority: "high",
      dueDate: "2030-01-01T00:00:00.000Z",
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.title).toBe("Important task");
    expect(completed.description).toBe("Some description");
    expect(completed.dueDate).toBe("2030-01-01T00:00:00.000Z");
  });

  it("should handle completing an already completed task", () => {
    const task = taskService.create({
      title: "Already done",
      status: "done",
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe("done");
    expect(completed.completedAt).toBeDefined();
  });
});
