# Execute the contract

- **E1** Follow the Plan of the contract in order. Do not widen the scope: what
  the Plan does not ask for is not done.
- **E2** <!-- AC-DEV-003.1 -->Keep `.forja/WO-N/checklist.md` up to date. Every
  step ends `[x]` (done) or `[SKIP] <reason>`. Never deliver with steps left
  unmarked.
- **E3** <!-- AC-DEV-003.2 -->When a condition of the contract's "When to stop
  and escalate" happens, **stop** and escalate with `comment_work_order`
  (`workOrder`, `body`): what happened, what was expected, what you need. Do not
  implement it on your own. Anything out of scope that you find is not fixed:
  it goes to the report as a finding (see [report](report.md)).
- **E4** Adjustments against the contract that do not change the scope are noted
  for the delivery report (see [start](start.md)). Never invent a verifiable fact
  (a commit, a version, a count): get it with the command that gives it.
