import { GeneratedScope, OriginalScope } from "./types";
export declare function encodeOriginalScopes(originalScope: OriginalScope, names: string[]): string;
export declare function encodeGeneratedScopes(generatedScope: GeneratedScope, originalScopes: OriginalScope[], names: string[]): string;
