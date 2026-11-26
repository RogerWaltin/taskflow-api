# TaskFlow Learning Progress

> This file records the learner's actual progress. Update it after every completed implementation checkpoint and after verification. Do not mark work complete based only on code being written.
>
> **Source of truth for requirements:** `docs/TASKFLOW-CURRICULUM.pdf`. See `docs/TASKFLOW-CURRICULUM.md` for a navigation summary.

Last reviewed: 2026-11-26

## Current position

- **Current phase:** Phase 2 — Fail-Fast Config, Boundary Validation, DTOs vs Entities, Custom Pipes.
- **Current working unit:** Lab 2 completed; the next working unit has not yet been recorded.
- **Current status:** Lab 2 completed (learner-reported); Phase 2 remains in progress.
- **Current focus:** Lab 2's DTO-based request validation and global validation setup have been reported finished. Phase-wide acceptance criteria, CI evidence, and the viva/sign-off process remain separate.
- **Next action:** Kick off the next Phase 2 working unit using the curriculum and the learner's current plan. Do not infer or skip ahead in the sequence.

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
| Phase 2 — Lab 2: DTOs and boundary validation                       | Completed (learner-reported)     | On 2026-11-26, the learner reported finishing Lab 2. The scope is recorded below. Exact test/check commands and criterion-by-criterion demonstration evidence were not supplied in this progress update; this does not imply Phase 2 sign-off. |
| Phase 2 — remaining work                                            | Not started / to be confirmed    | Determine from the learner's current lab plan and curriculum; do not assume lab numbering from the PDF.                                                                                                                                                                                                                 |
| Phase 3 — PostgreSQL persistence and data modeling                  | Not started                      | ORM choice must be discussed at kickoff. The PDF specifies Prisma by default; TypeORM requires mentor approval at kickoff and equivalent migrations/schema.                                                                                                                                                             |
| Phase 4 — Authentication and authorization                          | Not started                      | Depends on Phase 3 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 5 — Observability and error handling                          | Not started                      | Depends on Phase 4 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 6 — Caching, domain events and background jobs                | Not started                      | Depends on Phase 5 sign-off.                                                                                                                                                                                                                                                                                            |
| Phase 7 — Automated testing and production readiness                | Not started                      | Depends on Phase 6 sign-off. Resolve the curriculum's Jest examples vs repository's current Vitest setup at kickoff.                                                                                                                                                                                                    |

## Completed working unit — Phase 2 Lab 2

### Scope reported complete by the learner

- Create and use `CreateProjectDto`.
- Create and use `CreateTaskDto`.
- Ensure project creation and task creation controllers use the correct DTOs.
- Ensure invalid request input is rejected at the application boundary and does not reach service methods.
- Remove hand-written request validation from controllers/services where the Phase 2 requirements require DTO/pipe validation.
- Ensure global validation configuration is installed exactly once through `configureApp(app)` and reused by application bootstrap and tests.

### Verification record

The learner reported Lab 2 as finished on 2026-11-26. This progress update records that learner-reported completion; it does not independently record the exact test commands/results or mark individual curriculum acceptance criteria as demonstrated. Add specific verification evidence if it is reviewed later. Phase 2 remains in progress until its phase-wide acceptance criteria, CI, viva, and learner sign-off are complete.

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
- **2026-11-26:** Recorded Phase 2 Lab 2 as completed (learner-reported). Formal Phase 2 sign-off remains outstanding; exact test/check evidence was not added in this update.
- **2026-11-26:** Formal Phase 1 sign-off remains unverified.

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
