
---
description: Independently review the latest TaskFlow checkpoint
agent: explore
subagent: true
---

Perform an independent, read-only code review of the latest TaskFlow checkpoint.

## 1. Understand the context

First, read:
- AGENTS.md
- docs/PROGRESS.md
- The relevant section of docs/TASKFLOW-CURRICULUM.md

Use the original PDF only for targeted verification when necessary.

Determine which checkpoint is being reviewed. Inspect the actual Git changes and relevant source files. If the changes are already committed, inspect the relevant commits or branch changes too.

## 2. Review the implementation

Review for:

1. NestJS and TypeScript correctness.
2. Architectural problems.
3. Bugs and edge cases.
4. Validation and error handling.
5. Missing or inadequate tests.
6. Violations of curriculum requirements.
7. Violations of AGENTS.md instructions.

## 3. Verify curriculum compliance

This is particularly important.

- Identify the relevant curriculum requirement IDs (G, C, AC, V).
- Compare the implementation against each applicable requirement.
- Identify which acceptance criteria are satisfied, unsatisfied, or not verifiable.
- Explain the evidence supporting each conclusion.
- Do not treat passing tests as automatic proof of curriculum compliance.

## 4. Report findings

For every finding:
- Give the file and line number.
- Explain the problem.
- Explain why it matters.
- Suggest a correction.

Classify findings as Critical, Important, or Minor.

Do not modify any files.
Do not assume something is wrong without evidence.
Do not report speculative issues as confirmed bugs.

If something cannot be verified, explicitly say so.

Finish with an overall review summary.

Additional review focus: $ARGUMENTS
