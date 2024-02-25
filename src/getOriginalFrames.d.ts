import { Location, DebuggerScope, DebuggerFrame, OriginalLocation, OriginalScope, GeneratedScope } from "./types";
export declare function getOriginalFrames(location: Location, originalLocation: OriginalLocation, generatedScopes: GeneratedScope, originalScopes: OriginalScope[], debuggerScopeChain: DebuggerScope[]): DebuggerFrame[];
