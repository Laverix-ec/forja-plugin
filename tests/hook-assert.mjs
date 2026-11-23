import assert from "node:assert/strict";

// A denied call: exit 2 and a message with the rule, the order to stop and
// the warning that the check blocks more than it needs.
export const assertDenied = (result, rule, label) => {
  assert.equal(result.status, 2, `${label} should be denied`);
  assert.match(result.stderr, new RegExp(`rule ${rule}`), label);
  assert.match(result.stderr, /Stop and tell the developer/, label);
  assert.match(result.stderr, /on purpose/, label);
  assert.equal(result.stdout, "", label);
};

// An allowed call: exit 0 and no output at all.
export const assertAllowed = (result, label) => {
  assert.equal(result.status, 0, `${label} should be allowed`);
  assert.equal(result.stdout, "", label);
  assert.equal(result.stderr, "", label);
};
