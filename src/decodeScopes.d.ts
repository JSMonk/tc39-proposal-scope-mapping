import { GeneratedScope, OriginalScope } from "./types";
export declare function decodeOriginalScopes(encodedScopes: string[], names: string[]): OriginalScope[];
export declare function decodeGeneratedScopes(encodedScopes: string, names: string[], originalScopes: OriginalScope[]): GeneratedScope;
