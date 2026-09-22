---

name: project-maturity-auditor
description: Audit a software repository as a complete engineering product and identify what should be improved to make it maintainable, production-oriented, technically coherent, and strong as a professional GitHub portfolio project. Use when the user asks to review, audit, evaluate, mature, consolidate, professionalize, or improve an existing software repository. Do not use for isolated code reviews, single-file bug fixes, or implementation-only requests.
---

# Project Maturity Auditor

Evaluate the repository as a complete software product rather than as a collection of isolated files.

The goal is to identify what prevents the repository from looking and behaving like a well-engineered real-world project.

## Core principles

1. Understand the project before judging the implementation.
2. Inspect the repository broadly before producing conclusions.
3. Base findings on evidence from the repository.
4. Prefer simple and justified improvements over architectural complexity.
5. Do not recommend technology only because it is popular.
6. Distinguish product gaps from engineering gaps.
7. Prioritize improvements by impact and cost.
8. Consider the repository both as software and as a professional portfolio project.
9. Do not modify the repository during the initial audit.
10. Explicit user instructions always take priority over this skill.

# Audit workflow

## Phase 1 — Repository discovery

Inspect the repository before making recommendations.

Look for:

* README and documentation;
* package/dependency manifests;
* source directories;
* application entrypoints;
* database schemas and migrations;
* configuration files;
* environment variable examples;
* Docker files;
* CI/CD configuration;
* tests;
* lint and formatting configuration;
* API definitions;
* deployment configuration;
* scripts;
* gitignore;
* sample data or seeds.

Do not assume architecture from directory names alone.

Trace representative application flows whenever possible.

Examples:

request → route → controller → service → repository → database

or:

page → component → state → API → backend → database

## Phase 2 — Understand the product

Determine:

* what problem the software solves;
* who appears to be the intended user;
* the primary use cases;
* the main modules;
* the core domain entities;
* the main application flows;
* the technologies used;
* the apparent development stage.

Identify features or modules that appear unrelated, abandoned, duplicated, experimental, or incomplete.

If the project purpose cannot be confidently determined, explicitly state the uncertainty.

## Phase 3 — Architecture analysis

Read:

`references/architecture-checklist.md`

Evaluate the architecture only after understanding the product.

Do not recommend replacing the architecture simply because another architecture is more popular.

Every architectural recommendation should answer:

* What problem exists?
* Where does it occur?
* What impact does it have?
* What is the smallest reasonable improvement?

## Phase 4 — Security analysis

Read:

`references/security-checklist.md`

Perform a security review appropriate to the technologies actually present in the repository.

Do not invent security requirements for technologies the project does not use.

Prioritize exploitable or realistic problems over theoretical concerns.

## Phase 5 — Repository maturity

Read:

`references/repository-maturity.md`

Evaluate:

* testing;
* developer experience;
* CI/CD;
* Docker;
* configuration;
* dependency management;
* documentation;
* observability;
* maintainability.

The target is a strong individual or small-team project, not enterprise bureaucracy.

## Phase 6 — Portfolio analysis

Read:

`references/portfolio-checklist.md`

Evaluate the repository from the perspective of:

* another developer;
* a technical recruiter;
* a senior engineer;
* a technical interviewer.

Determine whether the repository communicates engineering maturity clearly.

## Evidence requirements

Avoid generic recommendations.

For important findings, reference concrete repository evidence whenever possible:

* file paths;
* directories;
* configuration;
* modules;
* functions;
* classes;
* schemas;
* workflows.

Prefer:

`src/services/order.service.ts mixes persistence, business rules, and HTTP-specific error handling.`

instead of:

`Improve separation of concerns.`

If evidence is incomplete, say so.

## Prioritization

Use these priorities:

### P0 — Critical

Problems that create severe security, data integrity, build, deployment, or architectural failures.

### P1 — High

Problems that significantly harm maintainability, reliability, or the completeness of the product.

### P2 — Medium

Improvements that meaningfully increase engineering quality but are not blocking.

### P3 — Portfolio / Differentiators

Improvements that make the project more demonstrative, polished, or technically interesting.

Do not artificially create P0 or P1 issues.

## Avoid overengineering

Do not recommend technologies such as:

* microservices;
* Kubernetes;
* Kafka;
* CQRS;
* event sourcing;
* service meshes;
* multiple databases;
* distributed tracing infrastructure;

unless the repository presents a concrete problem that justifies them.

Prefer boring, understandable, maintainable solutions.

## Feature recommendations

When proposing new features, classify them as:

### Essential

Required for the main product proposition to feel complete.

### Important

Meaningfully improves usability, reliability, or product value.

### Differentiator

Provides interesting technical depth or portfolio value.

Do not recommend features simply to increase project scope.

## Portfolio goal

The repository should eventually demonstrate:

* clear product purpose;
* coherent architecture;
* maintainable code;
* reasonable tests;
* secure defaults;
* reproducible setup;
* automated quality checks;
* useful documentation;
* deployability;
* intentional technical decisions.

The project should create useful technical discussion during an interview.

## Output

Use the structure defined in:

`assets/audit-report.md`

The report must end with an actionable backlog.

Tasks must be specific enough that the user could later request:

`Implement P1-03`

and another agent could understand what needs to be changed.

## Initial audit restriction

During the initial repository audit:

DO NOT:

* refactor files;
* install dependencies;
* change configuration;
* modify source code;
* rewrite documentation;
* create migrations;
* implement suggested features.

Only investigate, analyze, explain, prioritize, and propose.

Changes should happen only after the user explicitly requests implementation.

## Re-audit

If the user asks to audit the repository again after improvements:

* compare the current state against previous findings when available;
* identify resolved issues;
* identify partially resolved issues;
* identify remaining issues;
* identify new issues introduced by the changes;
* update priorities accordingly.
