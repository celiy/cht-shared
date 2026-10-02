/**
 * Run: node cht-shared/src/format/displayMasks.check.js
 */
import assert from "node:assert/strict";
import {
    formatCpfDisplay,
    maskCpfDisplay,
    maskCnpjDisplay,
    maskDocumentoDisplay
} from "./displayMasks.ts";

assert.equal(formatCpfDisplay("52998224725"), "529.982.247-25");
assert.equal(maskCpfDisplay("52998224725"), "***.***.***-25");
assert.equal(maskCnpjDisplay("11222333000181"), "**.***.***/****-81");
assert.equal(maskDocumentoDisplay("52998224725"), "***.***.***-25");
assert.equal(maskCpfDisplay(""), "—");

console.log("displayMasks.check: ok");
