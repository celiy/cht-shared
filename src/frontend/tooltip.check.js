/**
 * Run: node cht-shared/src/frontend/tooltip.check.js
 */
import assert from "node:assert/strict";
import { resolveShowDelay } from "./tooltipDelay.js";

assert.equal(resolveShowDelay(undefined), 100);
assert.equal(resolveShowDelay(null), 100);
assert.equal(resolveShowDelay("50"), 100);
assert.equal(resolveShowDelay(NaN), 100);
assert.equal(resolveShowDelay(0), 0);
assert.equal(resolveShowDelay(250), 250);
assert.equal(resolveShowDelay(-10), 0);

console.log("tooltip.check: ok");
