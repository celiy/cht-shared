/**
 * Run: node cht-shared/src/frontend/keybinds.check.js
 */
import assert from "node:assert/strict";
import {
    advanceKbdSequence,
    kbdKeyNames,
    matchesKey
} from "./keybinds.ts";

function keyEvent(key, extra = {}) {
    return {
        key,
        defaultPrevented: extra.defaultPrevented ?? false,
        ctrlKey: extra.ctrlKey ?? false,
        altKey: extra.altKey ?? false,
        metaKey: extra.metaKey ?? false
    };
}

assert.deepEqual(kbdKeyNames(undefined), []);
assert.deepEqual(kbdKeyNames([{ key: "enter" }, { key: "shift" }]), ["enter", "shift"]);
assert.deepEqual(kbdKeyNames([{ key: "" }, { key: "s" }]), ["s"]);

assert.equal(matchesKey(keyEvent("Enter"), "enter"), true);
assert.equal(matchesKey(keyEvent("Shift"), "shift"), true);
assert.equal(matchesKey(keyEvent("s", { ctrlKey: true }), "s"), false);

let next = advanceKbdSequence(0, keyEvent("s"), ["s"]);
assert.equal(next.complete, true);
assert.equal(next.step, 0);

next = advanceKbdSequence(0, keyEvent("Enter"), ["enter", "shift"]);
assert.equal(next.complete, false);
assert.equal(next.step, 1);

next = advanceKbdSequence(1, keyEvent("Shift"), ["enter", "shift"]);
assert.equal(next.complete, true);
assert.equal(next.step, 0);

next = advanceKbdSequence(1, keyEvent("x"), ["enter", "shift"]);
assert.equal(next.complete, false);
assert.equal(next.step, 0);

next = advanceKbdSequence(1, keyEvent("Enter"), ["enter", "shift"]);
assert.equal(next.complete, false);
assert.equal(next.step, 1);

next = advanceKbdSequence(0, keyEvent("x"), ["enter", "shift"]);
assert.equal(next.complete, false);
assert.equal(next.step, 0);

console.log("keybinds.check: ok");
