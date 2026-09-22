# Portfolio Project Review

Evaluate the repository as something a technical interviewer could inspect.

## First impression

Determine whether someone can understand within a few minutes:

* what the project is;
* what problem it solves;
* why it exists;
* what technologies it uses;
* how to run it;
* what makes it technically interesting.

## README

A strong README may contain:

1. concise project description;
2. problem and solution;
3. screenshots or demo;
4. main features;
5. architecture overview;
6. technology stack;
7. setup instructions;
8. environment configuration;
9. tests;
10. deployment/demo link;
11. relevant technical decisions.

Do not turn the README into full internal documentation.

## Signals of engineering maturity

Look for evidence of:

* clear architecture;
* meaningful commit history;
* tests around important flows;
* CI;
* database migrations;
* validation;
* error handling;
* secure configuration;
* reproducible environments;
* technical documentation.

## Weak portfolio signals

Identify whether the repository resembles:

### Tutorial project

Characteristics may include:

* generic functionality;
* copied architecture;
* little customization;
* no meaningful domain complexity.

### Academic exercise

Characteristics may include:

* implementation focused only on assignment requirements;
* no deployment;
* minimal documentation;
* little operational consideration.

### Prototype

Characteristics may include:

* happy-path-only implementation;
* little validation;
* no tests;
* incomplete workflows;
* temporary architecture.

Do not use these labels disrespectfully. Explain the concrete evidence.

## Interview value

Identify technical decisions that could generate useful discussion, such as:

* architecture tradeoffs;
* authentication design;
* database modeling;
* concurrency;
* event processing;
* caching;
* background jobs;
* external integrations;
* CI/CD;
* deployment;
* testing strategy.

## Product completeness

Distinguish between:

### Essential features

Necessary for the project's core proposition.

### Important features

Make the product substantially more usable or reliable.

### Differentiators

Demonstrate technical depth without bloating scope.

## Avoid portfolio theater

Do not recommend technology merely to impress recruiters.

Examples:

* Kubernetes for one container;
* Kafka with no meaningful event volume;
* microservices for a small application;
* dozens of meaningless tests;
* interfaces for every class;
* extensive documentation nobody needs.

Technical simplicity with clear reasoning is a positive signal.

## Final portfolio question

At the end of the review answer:

> If a senior engineer opened this repository today, what evidence would convince them that the author understands software engineering beyond simply making features work?
