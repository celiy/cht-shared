/**
 * Run: node cht-shared/src/mecarvit/osStatus.check.js
 */
import assert from "node:assert/strict";
import {
    OS_STATUS,
    allowedOsStatusTargets,
    canChangeOsStatus,
    osStatusChangeBlockedReason
} from "./osStatus.ts";

assert.deepEqual(
    allowedOsStatusTargets(OS_STATUS.ORCAMENTO, false).sort(),
    [OS_STATUS.ABERTA, OS_STATUS.PENDENTE, OS_STATUS.EM_ANDAMENTO, OS_STATUS.CANCELADA].sort()
);
assert.equal(canChangeOsStatus(OS_STATUS.CONCLUIDA, OS_STATUS.REABERTA, true), true);
assert.equal(canChangeOsStatus(OS_STATUS.REABERTA, OS_STATUS.CONCLUIDA, false), true);
assert.equal(canChangeOsStatus(OS_STATUS.ABERTA, OS_STATUS.ORCAMENTO, false), true);
assert.equal(canChangeOsStatus(OS_STATUS.ABERTA, OS_STATUS.ORCAMENTO, true), false);
assert.ok(osStatusChangeBlockedReason(OS_STATUS.ABERTA, OS_STATUS.ORCAMENTO, true));
assert.equal(canChangeOsStatus(OS_STATUS.CANCELADA, OS_STATUS.ABERTA, false), false);
assert.equal(canChangeOsStatus(OS_STATUS.PENDENTE, OS_STATUS.CONCLUIDA, false), false);

console.log("osStatus.check: ok");
