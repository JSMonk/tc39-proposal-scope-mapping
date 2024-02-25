"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeGeneratedScopes = exports.encodeOriginalScopes = void 0;
const vlq_1 = require("vlq");
const util_1 = require("./util");
function encodeOriginalScopes(originalScope, names) {
    let currentLine = 0;
    const encodedItems = [];
    for (const item of (0, util_1.getScopeItems)(originalScope)) {
        let encodedItem = "";
        if (item.kind === "start") {
            encodedItem += (0, vlq_1.encode)(item.scope.start.line - currentLine);
            encodedItem += (0, vlq_1.encode)(item.scope.start.column);
            encodedItem += (0, vlq_1.encode)(util_1.scopeKinds.indexOf(item.scope.kind) + 1);
            encodedItem += (0, vlq_1.encode)((item.scope.name ? 1 : 0));
            if (item.scope.name) {
                encodedItem += (0, vlq_1.encode)(getNameIndex(item.scope.name, names));
            }
            for (const variableName of item.scope.variables) {
                encodedItem += (0, vlq_1.encode)(getNameIndex(variableName, names));
            }
            currentLine = item.scope.start.line;
        }
        else {
            encodedItem += (0, vlq_1.encode)(item.scope.end.line - currentLine);
            encodedItem += (0, vlq_1.encode)(item.scope.end.column);
            currentLine = item.scope.end.line;
        }
        encodedItems.push(encodedItem);
    }
    return encodedItems.join(",");
}
exports.encodeOriginalScopes = encodeOriginalScopes;
function encodeGeneratedScopes(generatedScope, originalScopes, names) {
    var _a;
    let currentLine = 0;
    let currentColumn = 0;
    let currentOriginalScopeSourceIndex = 0;
    let currentOriginalScopeIndex = 0;
    let currentCallsiteSourceIndex = 0;
    let currentCallsiteLine = 0;
    let currentCallsiteColumn = 0;
    let encodedScopes = "";
    function addSeparatorAndRelativeColumn(location) {
        if (location.line > currentLine) {
            encodedScopes += ";".repeat(location.line - currentLine);
            encodedScopes += (0, vlq_1.encode)(location.column);
        }
        else {
            encodedScopes += ",";
            encodedScopes += (0, vlq_1.encode)(location.column - currentColumn);
        }
        currentLine = location.line;
        currentColumn = location.column;
    }
    const items = (0, util_1.getScopeItems)(generatedScope);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "start") {
            addSeparatorAndRelativeColumn(item.scope.start);
            encodedScopes += (0, vlq_1.encode)(util_1.scopeKinds.indexOf(item.scope.kind) + 1);
            encodedScopes += (0, vlq_1.encode)((item.scope.original ? 1 : 0) + (((_a = item.scope.original) === null || _a === void 0 ? void 0 : _a.callsite) ? 2 : 0));
            if (item.scope.original) {
                const { sourceIndex, scopeIndex } = findOriginalScopeIndices(item.scope.original.scope, originalScopes);
                encodedScopes += (0, vlq_1.encode)(sourceIndex - currentOriginalScopeSourceIndex);
                encodedScopes += (0, vlq_1.encode)(scopeIndex - (sourceIndex === currentOriginalScopeSourceIndex ? currentOriginalScopeIndex : 0));
                currentOriginalScopeSourceIndex = sourceIndex;
                currentOriginalScopeIndex = scopeIndex;
                const callsite = item.scope.original.callsite;
                if (callsite) {
                    encodedScopes += (0, vlq_1.encode)(callsite.sourceIndex - currentCallsiteSourceIndex);
                    encodedScopes += (0, vlq_1.encode)(callsite.line - (callsite.sourceIndex === currentCallsiteSourceIndex ? currentCallsiteLine : 0));
                    encodedScopes += (0, vlq_1.encode)(callsite.column - (callsite.sourceIndex === currentCallsiteSourceIndex && callsite.line === currentCallsiteLine ? currentCallsiteColumn : 0));
                    currentCallsiteSourceIndex = callsite.sourceIndex;
                    currentCallsiteLine = callsite.line;
                    currentCallsiteColumn = callsite.column;
                }
                for (const value of item.scope.original.values) {
                    (0, util_1.assert)(value.length > 0);
                    if (value.length === 1) {
                        encodedScopes += (0, vlq_1.encode)(value[0] ? getNameIndex(value[0], names) : -1);
                    }
                    else {
                        encodedScopes += (0, vlq_1.encode)(-value.length);
                        encodedScopes += (0, vlq_1.encode)(value[0] ? getNameIndex(value[0], names) : -1);
                        let currentLine = item.scope.start.line;
                        let currentColumn = item.scope.start.column;
                        for (const [loc, val] of value.slice(1)) {
                            if (loc.line === currentLine) {
                                (0, util_1.assert)(loc.column > currentColumn);
                                encodedScopes += (0, vlq_1.encode)(0);
                                encodedScopes += (0, vlq_1.encode)(loc.column - currentColumn);
                            }
                            else {
                                (0, util_1.assert)(loc.line > currentLine);
                                encodedScopes += (0, vlq_1.encode)(loc.line - currentLine);
                                encodedScopes += (0, vlq_1.encode)(loc.column);
                            }
                            currentLine = loc.line;
                            currentColumn = loc.column;
                            encodedScopes += (0, vlq_1.encode)(val ? getNameIndex(val, names) : -1);
                        }
                    }
                }
            }
        }
        else {
            addSeparatorAndRelativeColumn(item.scope.end);
        }
    }
    return encodedScopes;
}
exports.encodeGeneratedScopes = encodeGeneratedScopes;
function findOriginalScopeIndices(needle, haystack) {
    for (let sourceIndex = 0; sourceIndex < haystack.length; sourceIndex++) {
        const startItems = (0, util_1.getScopeItems)(haystack[sourceIndex]).filter(item => item.kind === "start");
        const scopeIndex = startItems.findIndex(item => item.scope === needle);
        if (scopeIndex >= 0) {
            return { sourceIndex, scopeIndex };
        }
    }
    (0, util_1.assert)(false);
}
function getNameIndex(name, names) {
    let index = names.indexOf(name);
    if (index < 0) {
        names.push(name);
        index = names.length - 1;
    }
    return index;
}
