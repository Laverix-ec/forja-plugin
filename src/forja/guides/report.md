# Report

- **R1** <!-- AC-DEV-004.5 -->When the local process ends, report to Forja:
  - Test results with `record_test_run`, one call per test: `workOrder`, `test`
    (the `key` of `tests[]`, like "T1"), `result` ("passed" or "failed"), `link`
    or `note`, and always `commit` with the full 40-character SHA, taken from
    `git rev-parse HEAD` right before the call, never from memory: an amend, a
    rebase or a merge after the tests changes it. Evidence files
    (screenshots, logs): call `create_evidence_upload` (`fileName`, `sizeBytes`,
    `mimeType`), send the file with PUT to the URL it returns, and pass
    `attachmentId`, `fileName` and `key` in `attachments` of `record_test_run`.
  - Findings with `report_finding` (`title`, `level`, `whatHappened`, `proposal`,
    `workOrder`, `architecture`), each one after looking for it with
    `list_findings` (a word of the title in `query`, and `architecture`). The
    `documentId` of the Architecture comes from `search_project`, not from
    `get_work_order`. If an equal finding exists, do not repeat it: add what is
    new as a comment with `comment_work_order`.
  - The pull request, linked with `link_pull_request`.
  - The delivery report and the move to review with `deliver_work_order`
    (`workOrder`, `items` of `kind` "info" or "pending"). It also ends your claim:
    do not call `release_work_order` afterwards. Informative items: adjustments
    against the contract, every `[SKIP]` with its reason, what you could not test.
    Pending items: whatever is left undone and blocks the work. A commit cited
    in an item is also taken from `git rev-parse HEAD` right before the call.
- **R2** Update the living documentation as the last step and in the same commit
  as the code (the way is in the Project's skills).
- **R3** Do not complete the Work Order: someone else does it when reviewing.
- **R4** Clean up what you created (worktree, test database, local branch) when
  the developer confirms or the Project's skills ask for it.
- **R5** If `deliver_work_order` or `record_test_run` answer with a permission
  error or say someone else holds the claim, do not retry in a loop: tell the
  developer.
