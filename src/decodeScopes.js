"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeGeneratedScopes = exports.decodeOriginalScopes = void 0;
const vlq_1 = require("vlq");
const util_1 = require("./util");
const util_2 = require("./util");
function decodeOriginalScopes(encodedScopes, names) {
    return encodedScopes.map((encodedScope, sourceIndex) => {
        const items = encodedScope.split(",").map(vlq_1.decode);
        const decoded = _decodeOriginalScopes(sourceIndex, items, names, { currentLine: 0 });
        (0, util_2.assert)(decoded.length === 1);
        return decoded[0];
    });
}
exports.decodeOriginalScopes = decodeOriginalScopes;
function _decodeOriginalScopes(sourceIndex, items, names, state) {
    const originalScopes = [];
    while (items.length > 0 && getOriginalItemKind(items[0]) === "start") {
        const startItem = items.shift();
        (0, util_2.assert)(startItem && startItem.length > 3);
        const startLine = startItem.shift() + state.currentLine;
        state.currentLine = startLine;
        const startColumn = startItem.shift();
        const kind = util_1.scopeKinds[startItem.shift() - 1];
        (0, util_2.assert)(kind !== "reference");
        const flags = startItem.shift();
        const hasName = !!(flags & 1);
        let name = undefined;
        if (hasName) {
            (0, util_2.assert)(startItem.length > 0);
            name = names[startItem.shift()];
        }
        const variables = [];
        while (startItem.length > 0) {
            variables.push(names[startItem.shift()]);
        }
        let children = [];
        if (getOriginalItemKind(items[0]) === "start") {
            children = _decodeOriginalScopes(sourceIndex, items, names, state);
        }
        const endItem = items.shift();
        (0, util_2.assert)(endItem && endItem.length === 2);
        const endLine = endItem.shift() + state.currentLine;
        state.currentLine = endLine;
        const endColumn = endItem.shift();
        const originalScope = {
            start: { sourceIndex, line: startLine, column: startColumn },
            end: { sourceIndex, line: endLine, column: endColumn },
            kind,
            variables,
        };
        if (name) {
            originalScope.name = name;
        }
        if (children.length > 0) {
            originalScope.children = children;
        }
        originalScopes.push(originalScope);
    }
    return originalScopes;
}
function getOriginalItemKind(item) {
    return item.length > 2 ? "start" : "end";
}
function decodeGeneratedScopes(encodedScopes, names, originalScopes) {
    const lineItems = encodedScopes.split(";").flatMap((items, line) => items.split(",").filter(Boolean).map(item => ({ line, item: (0, vlq_1.decode)(item) })));
    const decoded = _decodeGeneratedScopes(lineItems, names, originalScopes, {
        currentLine: 0,
        currentColumn: 0,
        currentOriginalScopeSourceIndex: 0,
        currentOriginalScopeIndex: 0,
        currentCallsiteSourceIndex: 0,
        currentCallsiteLine: 0,
        currentCallsiteColumn: 0,
    });
    (0, util_2.assert)(decoded.length === 1);
    return decoded[0];
}
exports.decodeGeneratedScopes = decodeGeneratedScopes;
function _decodeGeneratedScopes(lineItems, names, originalScopes, state) {
    const generatedScopes = [];
    while (lineItems.length > 0 && getGeneratedItemKind(lineItems[0].item) === "start") {
        const startItem = lineItems.shift();
        (0, util_2.assert)(startItem && startItem.item.length > 2);
        const startColumn = startItem.item.shift() + (startItem.line === state.currentLine ? state.currentColumn : 0);
        state.currentLine = startItem.line;
        state.currentColumn = startColumn;
        const kind = util_1.scopeKinds[startItem.item.shift() - 1];
        const flags = startItem.item.shift();
        const hasOriginal = !!(flags & 1);
        const hasCallsite = !!(flags & 2);
        let original = undefined;
        if (hasOriginal) {
            (0, util_2.assert)(startItem.item.length > 1);
            const sourceIndex = startItem.item.shift() + state.currentOriginalScopeSourceIndex;
            const scopeIndex = startItem.item.shift() + (sourceIndex === state.currentOriginalScopeSourceIndex ? state.currentOriginalScopeIndex : 0);
            state.currentOriginalScopeSourceIndex = sourceIndex;
            state.currentOriginalScopeIndex = scopeIndex;
            const scope = findOriginalScope(originalScopes, sourceIndex, scopeIndex);
            let callsite = undefined;
            if (hasCallsite) {
                (0, util_2.assert)(startItem.item.length > 2);
                const sourceIndex = startItem.item.shift() + state.currentCallsiteSourceIndex;
                const line = startItem.item.shift() + (sourceIndex === state.currentCallsiteSourceIndex ? state.currentCallsiteLine : 0);
                const column = startItem.item.shift() + (sourceIndex === state.currentCallsiteSourceIndex && line === state.currentCallsiteLine ? state.currentCallsiteColumn : 0);
                state.currentCallsiteSourceIndex = sourceIndex;
                state.currentCallsiteLine = line;
                state.currentCallsiteColumn = column;
                callsite = { sourceIndex, line, column };
            }
            const values = [];
            while (startItem.item.length > 0) {
                let indexOrLength = startItem.item.shift();
                let value;
                if (indexOrLength >= -1) {
                    value = [lookupName(names, indexOrLength)];
                }
                else {
                    value = [lookupName(names, startItem.item.shift())];
                    let currentLine = state.currentLine;
                    let currentColumn = state.currentColumn;
                    while (indexOrLength < -1) {
                        const line = currentLine + startItem.item.shift();
                        const column = startItem.item.shift() + (line === currentLine ? currentColumn : 0);
                        value.push([{ line, column }, lookupName(names, startItem.item.shift())]);
                        currentLine = line;
                        currentColumn = column;
                        indexOrLength++;
                    }
                }
                values.push(value);
            }
            original = { scope, values };
            if (callsite) {
                original.callsite = callsite;
            }
        }
        let children = [];
        if (getGeneratedItemKind(lineItems[0].item) === "start") {
            children = _decodeGeneratedScopes(lineItems, names, originalScopes, state);
        }
        const endItem = lineItems.shift();
        (0, util_2.assert)(endItem && endItem.item.length === 1);
        const endColumn = endItem.item.shift() + (endItem.line === state.currentLine ? state.currentColumn : 0);
        state.currentLine = endItem.line;
        state.currentColumn = endColumn;
        const generatedScope = {
            start: { line: startItem.line, column: startColumn },
            end: { line: endItem.line, column: endColumn },
            kind,
        };
        if (original) {
            generatedScope.original = original;
        }
        if (children.length > 0) {
            generatedScope.children = children;
        }
        generatedScopes.push(generatedScope);
    }
    return generatedScopes;
}
function getGeneratedItemKind(item) {
    return item.length > 1 ? "start" : "end";
}
function findOriginalScope(originalScopes, sourceIndex, scopeIndex) {
    const startItems = (0, util_1.getScopeItems)(originalScopes[sourceIndex]).filter(item => item.kind === "start");
    return startItems[scopeIndex].scope;
}
function lookupName(names, index) {
    if (index >= 0) {
        return names[index];
    }
    else {
        return undefined;
    }
}
