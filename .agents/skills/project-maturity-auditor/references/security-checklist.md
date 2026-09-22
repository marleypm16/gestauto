# Security Review Checklist

Apply only checks relevant to technologies present in the repository.

Focus on practical security issues rather than hypothetical vulnerabilities.

## Authentication

Check:

* password handling;
* session management;
* JWT validation;
* expiration;
* refresh mechanisms;
* logout/invalidation;
* secure cookie configuration.

## Authorization

Authentication does not imply authorization.

Verify whether protected resources enforce:

* ownership;
* roles;
* permissions;
* tenant isolation where relevant.

Look for authorization implemented only in the frontend.

## Input validation

Inspect:

* route parameters;
* request bodies;
* query parameters;
* forms;
* file uploads;
* webhook payloads;
* external API responses.

## Secrets

Search for potential exposure of:

* API keys;
* tokens;
* database credentials;
* private URLs;
* certificates;
* `.env` files.

Check whether `.env.example` documents required variables without exposing values.

## Database security

Evaluate realistic risks involving:

* SQL injection;
* NoSQL injection;
* unsafe raw queries;
* tenant isolation;
* authorization around data access.

## Web security

Where applicable evaluate:

* CORS;
* CSRF;
* XSS;
* secure cookies;
* security headers;
* redirect validation.

## API security

Consider:

* rate limiting;
* authentication coverage;
* authorization coverage;
* mass assignment;
* excessive data exposure;
* predictable sensitive identifiers.

## Logging

Check whether logs expose:

* passwords;
* tokens;
* authentication headers;
* personal data;
* secrets.

## Error responses

Check whether production responses expose:

* stack traces;
* database errors;
* internal paths;
* secrets;
* implementation details.

## Dependencies

Review dependency-management configuration and whether automated vulnerability/dependency updates would be useful.

Do not classify a package as vulnerable without evidence.

## Severity

Use:

### Critical

Likely compromise of sensitive data, authentication, authorization, or core system integrity.

### High

Realistic security weakness with meaningful impact.

### Medium

Security weakness requiring particular circumstances.

### Low

Hardening or defense-in-depth improvement.

Avoid exaggerating severity.


