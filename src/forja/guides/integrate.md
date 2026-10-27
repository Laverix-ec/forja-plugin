# Integrate

- **I1** <!-- AC-DEV-004.1 -->Before opening the pull request or moving the Work
  Order to review, bring the branch up to date with the base branch (`git fetch`,
  then rebase or merge as the Git skill says) and **verify again**.
- **I2** <!-- AC-DEV-004.2 -->A conflict in a shared registry or index
  (migration journal, indexes, key lists, message files) is resolved by
  **keeping the entries of both sides**.
- **I3** <!-- AC-DEV-004.3 -->A numbering conflict (migrations, finding numbers)
  is resolved by **renumbering your own, never what already got in**, and
  regenerating what derives from it (as the Project skills say).
- **I4** <!-- AC-DEV-004.4 -->A conflict that touches code outside the scope of
  the Work Order, or that changes what another one did, **stops you**: comment it
  in both Work Orders with `comment_work_order` and wait. The developer decides,
  with these same rules.
- **I5** Before pushing to the branch of an open pull request, check that it is
  still open and make the push depend on that result. Before saying a commit is
  not in a branch, check it with `git merge-base --is-ancestor`.
- **I6** Open the pull request (the title carries `WO-N`) and link it with
  `link_pull_request` (`workOrder`, `pullRequest`). Before saying it is ready,
  check that CI ran and passed.
