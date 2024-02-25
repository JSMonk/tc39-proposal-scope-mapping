export interface Location {
    line: number;
    column: number;
}
export interface LocationRange {
    start: Location;
    end: Location;
}
export interface OriginalLocation extends Location {
    sourceIndex: number;
}
export type ScopeKind = "module" | "class" | "function" | "block" | "reference";
export type MultiValue = [string | undefined, ...([Location, string | undefined][])];
export interface GeneratedScope {
    start: Location;
    end: Location;
    kind: ScopeKind;
    original?: {
        callsite?: OriginalLocation;
        scope: OriginalScope;
        values: MultiValue[];
    };
    children?: GeneratedScope[];
}
export interface OriginalScope {
    start: OriginalLocation;
    end: OriginalLocation;
    kind: Exclude<ScopeKind, "reference">;
    name?: string;
    variables: string[];
    children?: OriginalScope[];
}
export interface PrimitiveDebuggerValue {
    value: string | number | bigint | boolean | null | undefined;
}
export interface ObjectDebuggerValue {
    objectId: number;
}
export interface UnavailableValue {
    unavailable: true;
}
export type DebuggerValue = PrimitiveDebuggerValue | ObjectDebuggerValue | UnavailableValue;
export interface DebuggerScopeBinding {
    varname: string;
    value: DebuggerValue;
}
export interface DebuggerScope {
    bindings: DebuggerScopeBinding[];
}
export interface DebuggerFrame {
    name?: string;
    location: OriginalLocation;
    scopes: DebuggerScope[];
}
