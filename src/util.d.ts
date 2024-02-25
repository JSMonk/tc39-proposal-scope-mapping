import { GeneratedScope, Location, LocationRange, OriginalScope, ScopeKind } from "./types";
export declare function assert(condition: any): asserts condition;
export declare function findLastIndex<T>(array: T[], predicate: (value: T) => boolean): number;
export declare function isBefore(loc1: Location, loc2: Location): boolean;
export declare function isInRange(loc: Location, range: LocationRange): boolean;
export declare function isEnclosing(range1: LocationRange, range2: LocationRange): boolean;
export declare function compareLocations(loc1: Location, loc2: Location): 0 | 1 | -1;
export declare const scopeKinds: ScopeKind[];
export interface ScopeItem<T extends OriginalScope | GeneratedScope> {
    kind: "start" | "end";
    scope: T;
}
export declare function getScopeItems<T extends OriginalScope | GeneratedScope>(scope: T): ScopeItem<T>[];
