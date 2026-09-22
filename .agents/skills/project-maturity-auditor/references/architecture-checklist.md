# FILE: references/architecture-checklist.md

# Architecture Review Checklist

Use this reference when evaluating the internal engineering structure of a repository.

Do not treat every item as mandatory. Apply only what makes sense for the project's stack, size, and domain.

## 1. System boundaries

Identify:

* frontend;
* backend;
* workers;
* scheduled jobs;
* databases;
* queues;
* caches;
* external services;
* third-party APIs.

Determine whether the boundaries between these parts are explicit and understandable.

## 2. Module organization

Evaluate whether modules represent meaningful responsibilities or domain concepts.

Look for:

* unclear folder organization;
* unrelated functionality grouped together;
* domain logic scattered across the application;
* circular dependencies;
* excessive cross-module imports;
* duplicated concepts.

## 3. Separation of responsibilities

Check whether concerns such as these are appropriately separated:

* transport / HTTP;
* business rules;
* persistence;
* validation;
* authentication;
* authorization;
* external integrations;
* presentation;
* state management.

Identify classes, functions, hooks, services, controllers, or components with too many responsibilities.

## 4. Domain modeling

Identify the project's core entities and business rules.

Evaluate whether:

* entities represent the actual domain;
* relationships are understandable;
* rules are centralized appropriately;
* important concepts are represented explicitly;
* business logic leaks into UI or infrastructure layers.

Avoid recommending Domain-Driven Design unless the complexity actually justifies it.

## 5. Dependency direction

Inspect which modules depend on which.

Look for:

* infrastructure leaking into business logic;
* UI tightly coupled to persistence details;
* business services importing framework-specific objects unnecessarily;
* circular dependencies.

Prefer understandable dependency flow.

## 6. Abstractions

Identify both:

### Missing abstractions

Repeated behavior or concepts that should have one clear implementation.

### Unnecessary abstractions

Interfaces, factories, wrappers, helpers, or layers that provide no meaningful flexibility or clarity.

Do not reward abstraction for its own sake.

## 7. Code structure

Look for:

* very large files;
* very large functions;
* deeply nested logic;
* duplicated logic;
* hidden side effects;
* poor naming;
* inconsistent conventions;
* dead code;
* commented-out code;
* unresolved TODO/FIXME markers.

## 8. Error handling

Evaluate:

* global error handling;
* domain errors;
* HTTP error mapping;
* retries where appropriate;
* meaningful error messages;
* swallowed exceptions;
* excessive generic catch blocks.

## 9. Validation

Check where validation occurs.

Consider:

* API input;
* forms;
* environment variables;
* database constraints;
* external API responses.

Avoid duplicating validation unnecessarily.

## 10. Data model

If a database exists, inspect:

* entities/tables;
* relationships;
* foreign keys;
* constraints;
* unique constraints;
* indexes;
* enums;
* timestamps;
* migrations;
* transaction boundaries.

Look for potential:

* N+1 queries;
* unnecessary queries;
* missing indexes;
* inconsistent data;
* incorrect cardinality.

## 11. Performance

Only report realistic performance concerns.

Look for:

* repeated expensive work;
* unnecessary network requests;
* unbounded queries;
* large payloads;
* inefficient loops over large datasets;
* missing pagination;
* unnecessary frontend rerenders;
* inappropriate synchronous operations.

Do not recommend caching unless there is a clear reason.

## 12. Dependency quality

Inspect external dependencies.

Identify:

* duplicate libraries with the same purpose;
* dependencies used for trivial functionality;
* outdated architectural remnants;
* unnecessary framework mixing;
* inappropriate dependency direction.

## Architecture finding format

For significant findings provide:

**Finding**

Concrete description.

**Evidence**

Relevant file or module.

**Impact**

Why it matters.

**Recommendation**

Smallest reasonable improvement.

**Priority**

P0 / P1 / P2 / P3.


