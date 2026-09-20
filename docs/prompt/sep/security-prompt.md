### CODE QUALITY / PRODUCTION SAFETY — STRICT REQUIREMENTS

Review and implement the requested changes while following these rules strictly:

* Follow **production-level JavaScript/Node.js coding standards**, clean code principles, security best practices, and maintainable architecture.
* **Do not break any existing feature, business logic, API contract, database relationship, calculation, validation, payment flow, booking flow, or existing behavior** unless explicitly required by the requested change.
* Before modifying code, understand the existing implementation and **reuse existing services, utilities, helpers, validations, models, constants, and patterns** wherever possible.
* Do not duplicate existing logic. If the same logic is already implemented, reuse it instead of creating another version.
* Keep the changes **incremental and focused**. Do not perform unnecessary refactoring just for the sake of restructuring.
* Improve the folder/module structure only where it genuinely improves maintainability and separation of responsibility.
* Keep related functionality together and avoid unnecessarily spreading a single feature across many files.
* Avoid **deeply nested functions, callbacks, conditions, and helper functions** that make debugging and code tracing difficult.
* Prefer **simple, readable, linear control flow** with early returns and clear function boundaries.
* A function should generally perform one clear responsibility.
* Use nested/helper functions **only when there is a genuine reason**, such as:

  * The logic is large enough to require extraction.
  * The logic is reused.
  * The helper represents a clearly independent responsibility.
  * Extraction significantly improves readability.
* Do **not** create unnecessary one-line helper functions, wrappers, abstractions, services, or utility files just to make the code appear modular.
* Avoid unnecessary abstraction layers such as `service → helper → utility → wrapper → controller` when the logic can remain clear with fewer layers.
* Keep controllers thin where appropriate, but do not create excessive service/helper nesting.
* Use meaningful and consistent naming for variables, functions, files, modules, and constants.
* Keep asynchronous code straightforward using `async/await`.
* Handle errors explicitly and consistently with the existing project error-handling architecture.
* Do not expose sensitive information through API responses, logs, error messages, or exceptions.
* Validate and sanitize external/user input appropriately.
* Prevent common security issues such as:

  * Unauthorized access.
  * Missing ownership/permission checks.
  * Injection vulnerabilities.
  * Sensitive data exposure.
  * Improper validation.
  * Duplicate/unsafe requests.
  * Race conditions where relevant.
  * Insecure direct object access.
* Never trust client-provided values for security-sensitive or business-critical decisions when the backend can determine the value itself.
* Preserve existing authentication, authorization, RBAC, validation, and security mechanisms.
* Do not hardcode business-critical values when the existing system provides configuration/settings/constants for them.
* Avoid unnecessary database queries and duplicate API calls.
* Reuse existing database access patterns and avoid changing the database schema unless the requirement explicitly needs it.
* Do not introduce new dependencies unless there is a clear technical requirement and the dependency is justified.
* Keep performance in mind, especially for database queries, loops, API calls, and repeated calculations.
* Do not change working calculations or business rules merely to make the implementation "cleaner."
* Maintain backward compatibility wherever possible.
* Existing API response structures should remain compatible unless the requested feature explicitly requires an addition/change.
* New fields should preferably be additive rather than breaking existing consumers.
* Do not silently remove existing fields, endpoints, models, functions, or behavior.
* Do not rename existing public APIs or database fields unless explicitly required.
* Do not modify unrelated modules.

### FUNCTION / STRUCTURE GUIDELINE

Prefer:

`Controller → Service → existing utility/model`

when that is sufficient.

Do not unnecessarily create:

`Controller → Service → Service → Helper → Utility → Wrapper`

unless the complexity genuinely requires those layers.

For small logic, keep it simple and close to where it is used.

For large or reusable logic, extract it into a clearly named function/module.

The final code should be easy for another developer to:

1. Read.
2. Trace.
3. Debug.
4. Test.
5. Modify safely.

### BEFORE COMPLETING THE WORK

Check the affected flows for regressions and verify that:

* Existing features still work.
* Existing API contracts remain compatible.
* Existing business calculations remain unchanged.
* Existing authentication/authorization remains intact.
* Existing database relationships remain intact.
* Existing payment/booking/availability logic remains intact where applicable.
* No duplicate logic was introduced.
* No unnecessary nesting or abstraction was introduced.
* No dead code or unused imports were added.
* No unnecessary dependencies were added.
* Error handling is consistent.
* Security checks are preserved.
* The final folder/module structure is logical and easy to maintain.

### FINAL RULE

**Prefer the simplest production-quality implementation that satisfies the requirement.**

Do not over-engineer.

Do not rewrite working code without a real reason.

Do not optimize prematurely.

Do not create abstractions just for architectural appearance.

Make the **minimum safe changes required**, while leaving the codebase cleaner, more secure, easier to debug, and easier to maintain.
