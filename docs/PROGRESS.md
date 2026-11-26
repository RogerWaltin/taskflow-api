# TaskFlow Learning Progress

> This file records the learner's actual progress. Update it after every completed implementation checkpoint and after verification. Do not mark work complete based only on code being written.
>
> **Source of truth for requirements:** `docs/TASKFLOW-CURRICULUM.pdf`. See `docs/TASKFLOW-CURRICULUM.md` for a navigation summary.

Last reviewed: 2026-11-26

## Current position

- **Current phase:** Phase 2 — Fail-Fast Config, Boundary Validation, DTOs vs Entities, Custom Pipes.
- **Current working unit:** Lab 2 (tutoring/workflow label; the PDF itself describes Phase 2 in sections 2.1–2.6).
- **Current status:** In progress.
- **Current focus:** DTO-based request validation and global validation setup: project/task DTO usage, ensuring invalid input is rejected before reaching services, removing hand-written request validation from controllers/services where required, and ensuring the global ValidationPipe is installed once through `configureApp(app)`.
- **Next action:** Finish the current Lab 2 implementation and review its acceptance criteria against the Phase 2 specification before moving to the next working unit.

## Status definitions

- **Not started:** No implementation work has been reported.
- **In progress:** Work has begun but the checkpoint/lab is not yet verified complete.
- **Implemented:** Code has been written, but tests or demonstration may still be outstanding.
- **Tested:** The relevant tests/checks were run and passed. Record which commands or evidence support this.
- **Demonstrated:** The relevant curriculum acceptance criterion has been exercised and evidence recorded.
- **Viva passed:** The learner has answered the relevant viva questions to the curriculum's required standard.
- **Signed off:** All phase acceptance criteria are demonstrated, CI is green, and the learner has passed the phase viva. Only the learner can declare final sign-off.

Do not collapse these states into a single "done" label.

## Phase and lab status

| Phase / working unit                                                | Status                           | Notes                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 — Architecture, modules, controllers, services, DI and REST | Implementation reported complete | The learner moved on to Phase 2 after completing Phase 1 work. Formal acceptance-criteria evidence, CI sign-off and viva result are not recorded here; do not call the phase formally signed off without checking.                                                                                                      |
| Phase 2 — Lab 1: fail-fast configuration                            | Completed (learner-reported)     | The learner reported completing Phase 2 Lab 1. Re-open its acceptance criteria only if a regression or explicit review requires it.                                                                                                                                                                                     |
| Phase 2 — Lab 2: DTOs and boundary validation                       | In progress                      | Current work concerns CreateProjectDto/CreateTaskDto integration, invalid requests being blocked before service execution, eliminating hand-written input validation, and one shared `configureApp(app)` setup. Do not mark complete until verified against the lab checklist and relevant Phase 2 acceptance criteria. |
| Phase 2 — remaining work                                            | Not started / to be confirmed    | Determine from the learner's current lab plan and curriculum; do not assume lab numbering from the PDF.                                                                                                                                                                                                                 |
| Phase 3 — PostgreSQL persistence and data modeling                  | Not started                      | ORM choice must be discussed at kickoff. The PDF specifies Prisma by default; TypeORM requires mentor approval at kickoff and equivalent migrations/schema.                                                                                                                                                             |
| Phase 4 — Authentication and authorization                          | Not started                      | Depends on Phase 3 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 5 — Observability and error handling                          | Not started                      | Depends on Phase 4 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 6 — Caching, domain events and background jobs                | Not started                      | Depends on Phase 5 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 7 — Automated testing and production readiness                | Not started                      | Depends on Phase 6 sign-off. Resolve the curriculum's Jest examples vs repository's current Vitest setup at kickoff.                                                                                                                                                                                                    |

## Current checkpoint detail — Phase 2 Lab 2

### Reported work / current focus

- Create and use `CreateProjectDto`.
- Create and use `CreateTaskDto`.
- Ensure project creation and task creation controllers use the correct DTOs.
- Ensure invalid request input is rejected at the application boundary and does not reach service methods.
- Remove hand-written request validation from controllers/services where the Phase 2 requirements require DTO/pipe validation.
- Ensure global validation configuration is installed exactly once through `configureApp(app)` and reused by application bootstrap and tests.

### Completion evidence still required

Record each item only after checking it:

- [ ] Relevant DTOs and transformations match the Phase 2 specification.
- [ ] Project and task endpoints use the correct request DTOs.
- [ ] Invalid input is rejected before service execution.
- [ ] No hand-written input validation remains in service files where prohibited by C2.2.
- [ ] ValidationPipe is configured once through `configureApp(app)` in line with C2.3.
- [ ] Relevant unit/E2E tests pass.
- [ ] Phase 1 regression scenarios still pass, except intentional Phase 2 changes.
- [ ] Relevant lint, type-check and build checks pass.
- [ ] Lab-specific acceptance criteria are reviewed with the learner.

This checklist is a working record of the current task, not a claim that any unchecked item has passed.

## Phase sign-off record

| Phase   | Acceptance criteria demonstrated | CI green                             | Viva passed  | Learner sign-off |
| ------- | -------------------------------- | ------------------------------------ | ------------ | ---------------- |
| Phase 1 | Not recorded                     | Not recorded                         | Not recorded | Not recorded     |
| Phase 2 | In progress                      | Not recorded for phase-wide sign-off | Not recorded | Not signed off   |
| Phase 3 | Not started                      | —                                    | —            | —                |
| Phase 4 | Not started                      | —                                    | —            | —                |
| Phase 5 | Not started                      | —                                    | —            | —                |
| Phase 6 | Not started                      | —                                    | —            | —                |
| Phase 7 | Not started                      | —                                    | —            | —                |

## Progress log

- **2026-11-26:** Set up the TaskFlow project instructions to require phase kickoff planning, conceptual discussion, feature-sized checkpoints, checkpoint review pauses, and evidence-based progress updates.
- **2026-11-26:** Recorded the current position as Phase 2 Lab 2 in progress, based on the latest reported TaskFlow work. Formal Phase 1 sign-off remains unverified.

## Update protocol

After each implementation checkpoint:

1. Record the checkpoint and its scope.
2. Record changed files or the feature delivered where useful.
3. Mark implementation status based on actual code changes.
4. Record exact test/check commands and results; failures stay visible.
5. Mark acceptance criteria demonstrated only when evidence exists.
6. Record unresolved issues and the next action.
7. Stop before the next checkpoint until the learner has reviewed and understood the current one.

Never fabricate dates, test results, completed labs, demonstrated acceptance criteria, viva results, or phase sign-offs. If the current state is unclear, ask the learner rather than guessing.
