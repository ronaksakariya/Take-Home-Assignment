## What I'd test next

With more time, I would add tests around stricter pagination input validation, malformed request bodies, concurrent updates, and error-handling paths. I would also add tests for the server-level error middleware and consider testing behavior around very large datasets.

## What surprised me

The main thing that surprised me was how quickly the tests exposed real behavioral issues that were not obvious from the API surface. The pagination implementation was using a 0-based offset calculation even though the API exposed 1-based page numbers. I also found that completing a task was unintentionally resetting its priority to `medium`.

## Questions before shipping to production

I would clarify the API contract around reassignment, pagination validation, and task completion behavior. I would also ask how task ownership should be represented in production, whether authentication and authorization are required for task updates, and whether the in-memory store is only for this exercise or is expected to be replaced with a persistent database.
