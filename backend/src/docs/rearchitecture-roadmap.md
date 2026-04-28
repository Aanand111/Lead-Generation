# Re-Architecture Roadmap for 1M to 10M+ User Scale

## Purpose

This document is a build roadmap for future engineers or AI coding models.
It is written to be directly actionable against the current codebase.

Goals:

- Stabilize the current backend without a full rewrite.
- Re-architect the system so it can evolve from a single-node deployment to AWS-based horizontal scale.
- Support a realistic path toward `1M+ registered users`.
- Define the work needed for `high concurrency` and long-term `10M+ user` growth.

Non-goals:

- This document does **not** claim the current system can handle `1M concurrent active users`.
- This document does **not** recommend rewriting everything at once.
- This document does **not** use "single click" scaling language as a technical guarantee.

## Current Codebase Snapshot

Current backend layout:

- `src/controllers`
- `src/models`
- `src/routes`
- `src/services`
- `src/queues`
- `src/workers`
- `src/jobs`
- `src/utils`
- `src/config`

Current architectural issues already visible in code:

- Public diagnostic endpoint exposed in `src/server.js`
- Validation/auth inconsistencies across `authController`, `authMiddleware`, and `validators`
- PM2 cluster strategy over-allocates API and worker processes
- Heavy admin exports run synchronously in request/response cycle
- Notification fanout loads whole user sets into memory
- Realtime emits are local-process only
- Some hot queries are still not scale-safe
- Business logic is spread across controllers instead of isolated domain services

## Scale Definitions

Future implementers must stop using the word "users" without a metric.

Use these instead:

- `registered_users`
- `monthly_active_users`
- `daily_active_users`
- `concurrent_active_users`
- `requests_per_second`
- `peak_purchase_rps`
- `socket_connections`
- `p95_latency_ms`
- `p99_latency_ms`
- `queue_lag_seconds`

Recommended planning targets:

1. Stage A:
   - `100k registered_users`
   - `500k to 1M concurrent_active_users`
2. Stage B:
   - `1M registered_users`
   - `2k to 10k concurrent_active_users`
3. Stage C:
   - `10M registered_users`
   - `10k+ concurrent_active_users`

Anything above that must be justified by actual load tests.

## Operating Principles

All future work should follow these rules:

1. Keep the application stateless.
2. Keep business-critical writes idempotent.
3. Move heavy work out of HTTP request handlers.
4. Separate transactional paths from analytics/reporting paths.
5. Prefer modular monolith first, microservices later.
6. Add observability before claiming scalability.
7. Never scale process count without re-checking database connection math.

## Target End-State Architecture

The target architecture should evolve in this order.

### Phase 0 Target: Clean Modular Monolith

Keep a single deployable backend, but restructure internally into modules:

- `auth`
- `users`
- `vendors`
- `leads`
- `wallet`
- `subscriptions`
- `notifications`
- `analytics`
- `campaigns`
- `posters`
- `admin`

Each module should contain:

- route handlers
- service layer
- repository/data access layer
- validation schema
- events published/consumed

### Phase 1 Target: Horizontally Scalable Monolith

Still one codebase, but deployed as separate runtime roles:

- `api`
- `worker`
- `scheduler`

Required properties:

- stateless API nodes
- single scheduler instance
- queue-based async jobs
- shared Redis-backed ephemeral state
- shared DB constraints for correctness

### Phase 2 Target: Split by Workload Type

When scale demands it, split only the heavy or independently scalable parts:

- `core-api`
- `realtime-gateway`
- `notification-worker`
- `analytics-export-worker`
- `campaign-fanout-worker`

Do **not** split the core transactional domain too early.

### Phase 3 Target: Event-Driven Growth Architecture

Long-term optional architecture:

- transactional API service
- async domain event bus
- dedicated read model updaters
- dedicated notification service
- dedicated reporting service
- dedicated search service

This phase is only justified after earlier phases are stable.

## Recommended Module Boundaries for This Repo

Map the current codebase into these future modules:

### Auth Module

Current files:

- `src/controllers/authController.js`
- `src/controllers/passwordResetController.js`
- `src/middlewares/authMiddleware.js`
- `src/utils/validators.js`
- `src/routes/authRoutes.js`

Future structure:

- `src/modules/auth/routes`
- `src/modules/auth/controller`
- `src/modules/auth/service`
- `src/modules/auth/repository`
- `src/modules/auth/validators`

### Leads Module

Current files:

- `src/controllers/userController.js`
- `src/controllers/availableLeadsController.js`
- `src/models/leadModel.js`
- `src/models/availableLeadsModel.js`
- `src/routes/userRoutes.js`
- `src/routes/vendorRoutes.js`

Future structure:

- `src/modules/leads`
- `src/modules/lead-purchases`
- `src/modules/lead-read-models`

### Wallet and Subscription Module

Current files:

- `src/controllers/subscriptionController.js`
- `src/controllers/subscriptionPlanController.js`
- wallet-related logic inside `userController.js`
- `src/services/commissionService.js`

Future structure:

- `src/modules/wallet`
- `src/modules/subscriptions`
- `src/modules/referrals`
- `src/modules/commissions`

### Notification and Realtime Module

Current files:

- `src/controllers/notificationController.js`
- `src/controllers/adminNotificationController.js`
- `src/services/notificationService.js`
- `src/queues/notificationQueue.js`
- `src/workers/notificationWorker.js`
- `src/utils/socket.js`

Future structure:

- `src/modules/notifications`
- `src/modules/realtime`
- `src/modules/notification-preferences`

### Analytics and Reporting Module

Current files:

- `src/controllers/adminAnalyticsController.js`
- `src/models/adminAnalyticsModel.js`
- stats controllers

Future structure:

- `src/modules/analytics`
- `src/modules/reporting`
- `src/modules/exports`

## Mandatory Technical Changes

These are required before any claim of serious scale.

### 1. Security and Correctness

- Remove public diagnostic data exposure.
- Remove `admin` from public registration validation.
- Remove JWT fallback secrets.
- Enforce environment validation on boot.
- Apply DB constraints and missing indexes in production.
- Clean duplicate purchase data before unique constraints are applied.

### 2. Data Integrity

All money-like or credit-like operations must become idempotent:

- lead purchase
- wallet recharge
- subscription purchase
- referral reward
- commission credit
- payout creation

Required patterns:

- DB unique constraints
- transaction boundaries
- `FOR UPDATE` where needed
- idempotency keys
- retry-safe worker handlers

### 3. Query Safety

Every large listing path must support:

- pagination
- filtering
- deterministic ordering
- bounded result size

Every dashboard path must avoid live expensive aggregations when traffic grows.

### 4. Async Processing

Move these out of request handlers:

- report exports
- bulk notification fanout
- campaign sending
- vendor sync/maintenance jobs
- long-running admin operations

### 5. Realtime Safety

Socket state must not depend on a single process.

Required:

- authenticated socket connections
- shared pub/sub backend
- shared room/event propagation
- local memory only for per-process cache, never as source of truth

## Database Evolution Path

### Stage 1: Stabilize Current PostgreSQL

Do now:

- enforce missing unique constraints and indexes
- add migration verification at startup or deployment
- use strict connection budgeting
- remove unbounded report queries

### Stage 2: Add Connection and Read Scaling

Do next:

- add connection proxy/pooling
- add read replicas for reporting and read-heavy endpoints
- route analytics reads away from writer DB

### Stage 3: Partition Large Tables

Likely partition candidates:

- `transactions`
- `notifications`
- `lead_purchases`
- `campaign logs`
- `audit logs`

Partition strategy should be time-based first, not custom sharding first.

### Stage 4: Introduce Read Models

Create derived tables or materialized structures for:

- dashboard counters
- vendor performance summaries
- unread notification counts
- lead availability summaries

### Stage 5: Sharding Only If Necessary

Do not shard first.

Sharding should be considered only when:

- writer DB is proven bottleneck
- partitioning plus replicas are no longer sufficient
- data access patterns are well understood

Likely shard keys if ever needed:

- region
- tenant/account group
- user bucket

## Queue and Event Strategy

### Short-Term

Keep existing queue model but harden it:

- all workers idempotent
- dead-letter strategy
- retry policy
- observability on queue depth and failures

### Mid-Term

Introduce domain events for important state changes:

- `lead.created`
- `lead.purchased`
- `subscription.activated`
- `wallet.debited`
- `notification.requested`
- `campaign.dispatched`

### Long-Term

Use separate channels by concern:

- transactional commands
- async notifications
- reporting/export jobs
- audit events

## Caching Strategy

Cache only after correctness is fixed.

Recommended cache targets:

- dashboard summaries
- lead search/filter metadata
- rate-limit counters
- OTP and ephemeral auth state
- online presence / socket session data

Never use cache as source of truth for:

- wallet balance
- purchase ownership
- subscription entitlement

## AWS Adoption Path

This roadmap must work both before and after AWS adoption.

### Local or Single-Server Deployment

Roles:

- 1 API process group
- 1 worker process group
- 1 scheduler process
- PostgreSQL
- Redis

### AWS Stage 1

Use:

- `Application Load Balancer`
- `EC2 Auto Scaling Group` or `ECS service` for API
- separate worker instances/services
- `RDS PostgreSQL` with connection proxy
- `ElastiCache Redis`
- `S3` for exports/uploads
- `CloudWatch` for metrics and alarms

### AWS Stage 2

Add:

- read replicas
- autoscaling policies on API and workers
- async export storage in S3
- WAF in front of ALB
- CDN for static/frontend delivery

### AWS Stage 3

If growth justifies it:

- `Aurora PostgreSQL`
- separate realtime service
- event bus for service-to-service events
- dedicated analytics pipeline

### AWS Compatibility Rules

Any new code written by future implementers must obey:

1. no filesystem-local state for critical flows
2. no in-memory-only source of truth
3. no assumption of single instance
4. no assumption of sticky sessions for correctness
5. all background jobs must tolerate duplicate delivery
6. every export must be async and storage-backed

## Re-Architecture Execution Phases

### Phase 1: Stabilization

Objective:

- Make current backend safe to harden further.

Tasks:

- remove unsafe endpoints
- fix auth/validation inconsistencies
- apply migrations and indexes
- clean duplicate data
- reduce PM2/process counts
- separate API, worker, and scheduler roles
- add health/readiness checks

Definition of done:

- no known public critical endpoint exposure
- DB constraints applied in live environment
- deployment can run with predictable DB connection usage

### Phase 2: Internal Modularization

Objective:

- Move logic out of controllers into service and repository layers.

Tasks:

- carve modules from `controllers/models/routes`
- create shared transaction helper
- create consistent error model
- centralize validation
- centralize config/env validation

Definition of done:

- controllers are thin
- domain logic is testable without HTTP
- repositories isolate SQL access

### Phase 3: Transaction Hardening

Objective:

- Make financial and ownership flows correct under concurrency.

Tasks:

- add idempotency keys
- add unique constraints and transaction patterns
- move cross-entity side effects to events or outbox
- add race-condition integration tests

Definition of done:

- duplicate retries do not create duplicate purchases or credits
- concurrent requests preserve correctness

### Phase 4: Read Scalability

Objective:

- Reduce pressure on primary DB for read-heavy traffic.

Tasks:

- paginate all list endpoints
- introduce cached dashboard/read models
- move analytics/reporting off primary transactional queries
- make exports async

Definition of done:

- no unbounded admin/report query in request cycle
- hot user dashboard endpoints are bounded and cacheable

### Phase 5: Realtime and Notification Scale

Objective:

- Make notifications and sockets multi-instance safe.

Tasks:

- add shared pub/sub backing
- split realtime from notification fanout responsibilities
- implement chunked notification dispatch
- add delivery metrics and failure tracking

Definition of done:

- multi-node deployments can deliver realtime events consistently
- notification fanout no longer loads massive user sets in one request

### Phase 6: AWS-Ready Deployment Model

Objective:

- Make the application deploy cleanly to AWS and autoscale safely.

Tasks:

- containerize runtime roles if using ECS
- externalize config and secrets
- store files/exports in S3
- set up ALB, autoscaling, Redis, RDS, monitoring
- define rollout and rollback strategy

Definition of done:

- app can run on 2+ API nodes without code changes
- worker scaling does not break correctness

### Phase 7: Selective Service Extraction

Objective:

- Split only the workloads that actually benefit from independent scaling.

Suggested extraction order:

1. notification and campaign fanout
2. analytics/export service
3. realtime gateway
4. search service
5. only then evaluate wallet/core transactional split

Definition of done:

- extracted services have clear contracts
- no duplicated business rules between services

## Testing and Verification Plan

Every phase must ship with tests.

Minimum required test categories:

- unit tests for services
- integration tests for DB transactions
- API contract tests
- queue worker retry/idempotency tests
- load tests for hot endpoints

Mandatory load-test targets:

- login
- dashboard
- available leads listing
- lead purchase
- notifications
- admin export creation

Mandatory failure tests:

- Redis unavailable
- DB slow query scenario
- worker restart mid-job
- duplicate queue delivery
- multi-instance socket deployment

## Observability Requirements

No phase is complete without instrumentation.

Must-have metrics:

- request rate
- error rate
- p95 and p99 latency
- DB pool wait count
- DB query latency
- Redis latency
- queue depth
- queue processing lag
- worker failures
- socket connection count

Must-have logs:

- structured JSON logs
- request correlation ID
- user ID where appropriate
- job ID for async flows
- idempotency key for financial flows

## AI Model Handoff Instructions

Any future AI model working from this document must follow this order:

1. inspect current relevant files
2. restate module boundary before editing
3. keep changes incremental
4. do not rewrite unrelated areas
5. add or update tests with every phase
6. verify DB migration impact before code relying on it
7. preserve compatibility unless the phase explicitly allows breaking changes

### Prompt Template for Another AI Model

Use this prompt shape:

```text
You are implementing Phase <N> from backend/src/docs/rearchitecture-roadmap.md.

Goal:
<paste the exact phase objective>

Constraints:
- Keep the current product behavior intact unless explicitly stated.
- Work only in the modules/files required for this phase.
- Add tests for every correctness-sensitive change.
- Do not introduce in-memory-only state for distributed behavior.
- Keep the code AWS-compatible: stateless API, externalized state, async heavy work.

Deliverables:
- code changes
- migration changes if needed
- tests
- short implementation summary
- residual risks
```

### Prompt Template for Requirement-Driven Expansion

```text
Given backend/src/docs/rearchitecture-roadmap.md and the current codebase, implement the smallest possible set of changes to satisfy this requirement:

<requirement>

Rules:
- First classify the requirement as transactional, read-scaling, realtime, analytics, or infra.
- State which roadmap phase it belongs to.
- Reuse the roadmap module boundaries.
- Preserve AWS compatibility.
- If the requirement adds load, explain what metrics and tests must be added.
```

## Delivery Checklist for Each Phase

Every phase should produce:

- code changes
- migration files if needed
- test coverage
- updated env/config documentation
- rollback plan
- performance impact summary
- open risks

## Final Guidance

The correct path for this project is:

1. stabilize the monolith
2. modularize the monolith
3. externalize state
4. move heavy work async
5. add observability
6. deploy to AWS with safe horizontal scaling
7. split only the parts that prove to be scaling bottlenecks

If future implementers skip these steps and jump directly to microservices, they will increase complexity without solving the real bottlenecks.
