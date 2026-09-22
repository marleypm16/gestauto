# Repository Maturity Checklist

Evaluate whether another developer can understand, run, test, modify, and deploy the project.

## Local development

Check whether the repository clearly explains:

* prerequisites;
* installation;
* environment variables;
* database setup;
* migrations;
* seeds;
* development command;
* tests;
* production build.

A developer should not need hidden knowledge from the original author.

## Configuration

Evaluate:

* `.env.example`;
* configuration validation;
* development vs production configuration;
* sensible defaults;
* secret handling.

## Testing

Identify existing:

* unit tests;
* integration tests;
* API tests;
* end-to-end tests.

Focus on critical flows rather than raw coverage percentage.

Determine the highest-value missing tests.

## Static quality

Look for:

* formatter;
* linter;
* type checking;
* pre-commit checks when justified.

## CI

Evaluate whether CI automatically performs useful checks such as:

* dependency installation;
* lint;
* type checking;
* tests;
* build.

Prefer a small reliable pipeline over a complex one.

## CD

If the project is deployed, evaluate whether deployment is reproducible and documented.

Do not require continuous deployment merely for portfolio maturity.

## Docker

Where Docker exists, evaluate:

* Dockerfile quality;
* multi-stage builds where useful;
* unnecessary image size;
* healthchecks;
* volumes;
* networks;
* compose configuration;
* reproducible startup.

## Database lifecycle

Check:

* migrations;
* seeds;
* reset workflow;
* local development data;
* production migration strategy.

## Observability

For the project's scale, consider:

* structured logs;
* log levels;
* global error handling;
* health endpoint;
* request/correlation IDs;
* error monitoring.

Do not recommend enterprise monitoring stacks without a real need.

## Dependency management

Evaluate:

* lockfiles;
* dependency versions;
* unused dependencies;
* automated dependency updates where useful.

## GitHub repository hygiene

Consider:

* repository description;
* topics;
* README;
* license when appropriate;
* `.gitignore`;
* pull request template;
* issue templates;
* GitHub Actions;
* releases/tags;
* Dependabot or Renovate.

Only recommend items that create actual value.

## Documentation

Documentation should explain important decisions rather than obvious code.

Potential useful documents:

* `docs/architecture.md`;
* `docs/domain.md`;
* `docs/api.md`;
* `docs/deployment.md`;
* ADRs.

Do not recommend all of them automatically.

## Definition of mature enough

A portfolio repository does not need enterprise infrastructure.

It should preferably be:

* understandable;
* reproducible;
* testable;
* deployable;
* maintainable;
* reasonably secure;
* documented;
* intentionally designed.


