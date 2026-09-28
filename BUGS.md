# Bug Report

## Bug 1: Pagination returns incorrect results

### Expected behavior

For `GET /tasks?page=1&limit=10`, the API should return the first 10 tasks.

For `GET /tasks?page=2&limit=10`, the API should return the next 10 tasks.

### Actual behavior

Page 1 returns tasks 11 and 12 instead of tasks 1 through 10.

Page 2 returns an empty array even though tasks 11 and 12 exist.

### How it was discovered

The issue was discovered through unit tests for `taskService.getPaginated()` and confirmed through Supertest integration tests for `GET /tasks?page=...&limit=...`.

### Root cause

The pagination logic calculates the offset as:

`page * limit`

For 1-based page numbering, the offset should be:

`(page - 1) * limit`

### Proposed fix

Change the offset calculation to:

`const offset = (page - 1) * limit;`

---

## Bug 2: Completing a task changes its priority

### Actual behavior

Completing a `high` priority task changes its priority to `medium`.

### Example

Before:

```js
{ priority: "high", status: "todo" }
```

After `PATCH /tasks/:id/complete`:

```js
{ priority: "medium", status: "done" }
```

### Cause

`completeTask()` explicitly overwrites the priority:

```js
const updated = {
  ...task,
  priority: "medium",
  status: "done",
  completedAt: new Date().toISOString(),
};
```

### Proposed fix

If priority is intended to remain unchanged, remove the assignment that resets priority to `medium` when completing the task.
