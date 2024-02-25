"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScopeItems = exports.scopeKinds = exports.compareLocations = exports.isEnclosing = exports.isInRange = exports.isBefore = exports.findLastIndex = exports.assert = void 0;
function assert(condition) {
    if (!condition) {
        throw new Error("Assertion failed");
    }
}
exports.assert = assert;
function findLastIndex(array, predicate) {
    const reverseIndex = [...array].reverse().findIndex(predicate);
    return reverseIndex >= 0 ? (array.length - 1) - reverseIndex : -1;
}
exports.findLastIndex = findLastIndex;
function isBefore(loc1, loc2) {
    if (loc1.line < loc2.line) {
        return true;
    }
    else if (loc1.line > loc2.line) {
        return false;
    }
    else {
        return loc1.column < loc2.column;
    }
}
exports.isBefore = isBefore;
function isInRange(loc, range) {
    return !isBefore(loc, range.start) && !isBefore(range.end, loc);
}
exports.isInRange = isInRange;
function isEnclosing(range1, range2) {
    return isInRange(range2.start, range1) && isInRange(range2.end, range1);
}
exports.isEnclosing = isEnclosing;
function compareLocations(loc1, loc2) {
    if (isBefore(loc1, loc2)) {
        return -1;
    }
    else if (isBefore(loc2, loc1)) {
        return 1;
    }
    else {
        return 0;
    }
}
exports.compareLocations = compareLocations;
exports.scopeKinds = ["module", "function", "class", "block", "reference"];
function getScopeItems(scope) {
    var _a;
    const children = (_a = scope.children) !== null && _a !== void 0 ? _a : [];
    const childItems = children.flatMap(getScopeItems);
    return [
        { kind: "start", scope },
        ...childItems,
        { kind: "end", scope },
    ];
}
exports.getScopeItems = getScopeItems;
