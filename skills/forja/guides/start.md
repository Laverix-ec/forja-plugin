# Start a Work Order

Do this before changing any code. Mark each step in the checklist.

- **S1** Call `get_work_order` with `workOrder` ("WO-12" or "12"). Read the
  description, `executionContract`, the criteria (`requirements[].criteria[]`),
  the tests (`tests[]`: `key`, `testFile`, `status`, `lastRun`), `touches`, the
  `context`, the `repository` (`owner/name`, or `null`) and the
  comments.
  <!-- AC-DEV-002.1 -->
  If `executionContract` is `null`, **do not implement it**. Tell the developer
  that the Work Order has no execution contract (Forja does not let anyone take
  it either) and stop.
- **S2** Create `.forja/WO-N/` and copy [the checklist](../templates/checklist.md)
  to `.forja/WO-N/checklist.md`. If `.forja/` is not in `.git/info/exclude`, add
  it there (never to `.gitignore`).
- **S3** <!-- AC-DEV-002.7 -->Before reading the contract against the code, check
  that this checkout is the repository of the Work Order.
  - If `repository` is `null` or the field is missing, mark S3 as
    `[SKIP] no repository` and go on to S4.
  - Otherwise run `git remote get-url origin` in the checkout where you will
    work (only `origin`, no other remote). If the command fails (not a
    repository, or no `origin`), you cannot confirm it: do not take the Work
    Order, tell the developer and stop.
  - Normalize the result to `owner/name`: take what follows the host, without
    the leading slash, the trailing slash and the `.git` suffix. It works for
    HTTPS (also with credentials) and SSH. Never repeat credentials when you
    talk to the developer.
  - Compare it with `repository` ignoring case (the host is not compared). A
    fork has another owner, so it does not match.

  | `git remote get-url origin` | Normalized |
  |---|---|
  | `https://github.com/Acme/Widgets.git` | `Acme/Widgets` |
  | `https://user:secret@github.com/Acme/Widgets` | `Acme/Widgets` |
  | `git@github.com:Acme/Widgets.git` | `Acme/Widgets` |
  | `ssh://git@github.com/Acme/Widgets.git` | `Acme/Widgets` |
  | `https://github.com/acme/widgets.git` | `acme/widgets`, equal to `Acme/Widgets` ignoring case |

  If they do not match, **do not call `claim_work_order`** and do not create
  the branch. Tell the developer in one sentence which repository the Work
  Order belongs to (`repository`) and which one this checkout is (the
  `origin`, without credentials), and to open a checkout of that repository.
  Delete the `.forja/WO-N/` that S2 created here, leave S3 as `[ ]` and
  **stop**.
- **S4** <!-- AC-DEV-002.2 -->Before touching code, read the whole contract and
  the Project's skills: call `list_skills` (General and Development always;
  pass `category` "task" too) and `read_skill` with `skill` for each one whose
  `triggerDescription` applies, and for each one whose `triggerDescription` is
  `null` (its "Use when" section is missing: read it to decide). At least read
  the Git and the verification ones.
  Then check the contract against the current code: the reference commit of its
  "starting state" and the files in its "read first" list.
  - <!-- AC-DEV-002.3 -->If it does not match and the adjustment does not change
    the scope (moved files, renamed names, a newer commit), apply it and note it
    for the delivery report.
  - <!-- AC-DEV-002.4 -->If the adjustment changes the scope (adds or removes a
    capability, contradicts a criterion), **stop** and ask with
    `comment_work_order` (`workOrder`, `body`). Do not continue.
- **S5** <!-- AC-DEV-002.5 -->Take the Work Order with `claim_work_order`
  (`workOrder` and `branch`; the paths it touches are already in Forja, no tool
  writes them). Create the branch from the base branch of this repository. The branch name rule
  comes from the Git skill. The base branch comes, in this order, from: the Git
  skill; `git symbolic-ref refs/remotes/origin/HEAD`; asking the developer. No
  tool returns it.
- **S6** <!-- AC-DEV-002.6 -->If `claim_work_order` answers with `overlaps`
  (other taken Work Orders touching the same paths), **tell the developer before
  going on** and wait. If the developer decides not to continue, call
  `release_work_order` (`workOrder`).
- **S7** Work in an isolated environment. One Work Order at a time per agent;
  two in parallel only if independent, each with its own worktree, test database
  and port.
