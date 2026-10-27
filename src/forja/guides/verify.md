# Verify

- **V1** Verify by rounds: format what you touched, run the tests of what
  changed, and run **one** complete verification at the end. The concrete
  commands come from the Project's verification skill (`read_skill`).
- **V2** <!-- AC-DEV-003.3 -->A commit or a push that follows a verification
  **depends on its exit code**: `verify && commit`, or `if verify; then ...; fi`.
  Do not filter the output with `grep`, do not chain with `;`, and remember that
  the line after a heredoc is a new command, outside any `&&` chain. Never call a
  verification good by reading filtered output.
- **V3** Run the tests of the contract (`tests[]` of `get_work_order`) and keep
  each result to report it at the end (see [report](report.md)).
- **V4** If the Work Order has screens, test them in a real browser (console
  errors, hydration) and say what you could not test.
- **V5** <!-- AC-DEV-003.4 -->When the implementation is finished and before
  delivering, review it with your own agents, by dimensions: acceptance
  criteria, Architecture, Project conventions, tests and build, what is visible,
  security. If your tool has subagents, use one per group of files; if not, one
  pass per dimension. The result goes to the delivery report as informative or
  pending items, not to a file of the repository.
- **V6** If verifying needs test data that cannot be guessed, say so in the
  report.
