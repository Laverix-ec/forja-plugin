# Safety rules

These rules apply at every step of a Work Order, not only in one. Read them
before S1 and follow them until you deliver. They are not steps of the
checklist.

- **A1** <!-- AC-DEV-005.1 -->Never read a secrets file with any tool: not with
  `cat`, `head`, `tail`, `grep`, `sed`, `awk` or `wc`, not with your editor or
  file reader, not with a file search. Not its content, not some of its lines,
  not to count its lines and not to list the names of its variables. Secrets
  files are `.env` and `.env.*` (except `.env.example`, `.env.sample` and
  `.env.template`), `id_rsa*`, `id_ed25519*`, `id_ecdsa*`, `*.pem`, `*.key`,
  `*.p12`, `*.pfx`, `.npmrc`, `.netrc`, `.pypirc`, `*.tfvars`, `*.tfvars.json`,
  `*.tfstate`, `*.tfstate.backup` and `credentials.json`, in any directory,
  whatever the case. You may read `.env.example`, `.env.sample` and `.env.template`.
  When you need a configuration value or a secret, use what the contract says is
  already configured; if the contract does not say, ask the developer.
- **A2** <!-- AC-DEV-005.2 -->When a permission, the sandbox or a tool blocks an
  action, **stop**: tell the developer what was blocked and wait for their
  decision. Do not get the same result with another command or another tool
  (for example `grep` where `cat` was denied), and do not change permissions or
  settings to get past it. It also applies when nothing blocks you but a rule
  forbids the action.
- **A3** <!-- AC-DEV-005.3 -->Add every file to a commit by its exact path
  (`git add <path>`). Never add a whole directory or the whole tree: not
  `git add .`, not `git add -A` or `--all`, and not `git commit -a`. Before
  committing, check `git diff --cached --name-only` against the files you meant
  to add, and unstage what you did not (`git restore --staged <path>`).
- **A4** <!-- AC-DEV-005.4 -->Stop only the processes you started, by their
  process id or their process group. Save it when you launch the process; if you
  do not have it, find the process by the port it listens on. Never find a
  process by a text that the command itself contains (`pkill -f`, `pgrep -f`,
  `ps | grep | kill`): the command kills itself. A process you did not start is
  not stopped: tell the developer.
