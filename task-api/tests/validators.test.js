const {
  validateCreateTask,
  validateUpdateTask,
} = require("../src/utils/validators");

describe("validators", () => {
  describe("validateCreateTask", () => {
    it("should return null for a valid task", () => {
      expect(
        validateCreateTask({
          title: "Learn Jest",
          description: "Write tests",
          status: "todo",
          priority: "high",
          dueDate: "2026-10-01T00:00:00.000Z",
        }),
      ).toBeNull();
    });

    it("should reject a missing title", () => {
      expect(validateCreateTask({})).toBe(
        "title is required and must be a non-empty string",
      );
    });

    it("should reject an empty title", () => {
      expect(validateCreateTask({ title: "   " })).toBe(
        "title is required and must be a non-empty string",
      );
    });

    it("should reject an invalid status", () => {
      expect(
        validateCreateTask({
          title: "Task",
          status: "invalid",
        }),
      ).toBe("status must be one of: todo, in_progress, done");
    });

    it("should reject an invalid priority", () => {
      expect(
        validateCreateTask({
          title: "Task",
          priority: "urgent",
        }),
      ).toBe("priority must be one of: low, medium, high");
    });

    it("should reject an invalid dueDate", () => {
      expect(
        validateCreateTask({
          title: "Task",
          dueDate: "not-a-date",
        }),
      ).toBe("dueDate must be a valid ISO date string");
    });
  });

  describe("validateUpdateTask", () => {
    it("should return null for a valid partial update", () => {
      expect(
        validateUpdateTask({
          title: "Updated title",
          priority: "high",
        }),
      ).toBeNull();
    });

    it("should reject an empty title", () => {
      expect(
        validateUpdateTask({
          title: "   ",
        }),
      ).toBe("title must be a non-empty string");
    });

    it("should reject an invalid status", () => {
      expect(
        validateUpdateTask({
          status: "invalid",
        }),
      ).toBe("status must be one of: todo, in_progress, done");
    });

    it("should reject an invalid priority", () => {
      expect(
        validateUpdateTask({
          priority: "urgent",
        }),
      ).toBe("priority must be one of: low, medium, high");
    });

    it("should reject an invalid dueDate", () => {
      expect(
        validateUpdateTask({
          dueDate: "not-a-date",
        }),
      ).toBe("dueDate must be a valid ISO date string");
    });
  });
});
