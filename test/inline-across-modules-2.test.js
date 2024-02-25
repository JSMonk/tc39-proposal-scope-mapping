"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decodeScopes_1 = require("../src/decodeScopes");
const encodeScopes_1 = require("../src/encodeScopes");
const getOriginalFrames_1 = require("../src/getOriginalFrames");
/**
Taken from https://github.com/tc39/source-map-rfc/issues/61

Original sources:
- module.js:
```javascript
0 export const MODULE_CONSTANT = 'module_constant';
1
2 export class Logger {
3   static log(x) {
4     console.log(x);
5   }
6 }
```

- inline_across_modules.js:
```javascript
0  import {Logger} from './module.js';
1
2  function inner(x) {
3    Logger.log(x);
4  }
5
6  function outer(x) {
7    inner(x);
8  }
9
10 outer(42);
11 outer(null);
```

- Generated source:
```javascript
0 console.log(42);console.log(null);
```
*/
const scopeNames = ["MODULE_CONSTANT", "Logger", "log", "x", "inner", "outer", "\"module_constant\"", "42", "null"];
const encodedOriginalScopes = ["AACAAC,GgBECEG,EG,CC", "AACACIK,EkBECIG,EC,EkBECKG,EC,GY"];
const encodedGeneratedScopes = ",ACCCADDD,AKCDAMD,AKGCECUAO,AKGADAHEO,AKGDCAJEO,gB,A,A,A,AKCADMD,AKGCEAQAQ,AKGADAJEQ,AKGDCAJEQ,kB,A,A,A,A";
const originalScopes = [
    {
        start: { sourceIndex: 0, line: 0, column: 0 },
        end: { sourceIndex: 0, line: 6, column: 1 },
        kind: "module",
        variables: ["MODULE_CONSTANT", "Logger"],
        children: [
            {
                start: { sourceIndex: 0, line: 3, column: 16 },
                end: { sourceIndex: 0, line: 5, column: 3 },
                kind: "function",
                name: "log",
                variables: ["x"],
            }
        ]
    },
    {
        start: { sourceIndex: 1, line: 0, column: 0 },
        end: { sourceIndex: 1, line: 11, column: 12 },
        kind: "module",
        variables: ["Logger", "inner", "outer"],
        children: [
            {
                start: { sourceIndex: 1, line: 2, column: 18 },
                end: { sourceIndex: 1, line: 4, column: 1 },
                kind: "function",
                name: "inner",
                variables: ["x"],
            },
            {
                start: { sourceIndex: 1, line: 6, column: 18 },
                end: { sourceIndex: 1, line: 8, column: 1 },
                kind: "function",
                name: "outer",
                variables: ["x"],
            }
        ]
    }
];
const generatedScopes = {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 34 },
    kind: "module",
    original: {
        scope: originalScopes[1],
        values: [[undefined], [undefined], [undefined]],
    },
    children: [
        {
            start: { line: 0, column: 0 },
            end: { line: 0, column: 16 },
            kind: "reference",
            original: {
                scope: originalScopes[0],
                values: [["\"module_constant\""], [undefined]],
            },
            children: [
                {
                    start: { line: 0, column: 0 },
                    end: { line: 0, column: 16 },
                    kind: "reference",
                    original: {
                        scope: originalScopes[1].children[1],
                        values: [["42"]],
                        callsite: { sourceIndex: 1, line: 10, column: 0 },
                    },
                    children: [
                        {
                            start: { line: 0, column: 0 },
                            end: { line: 0, column: 16 },
                            kind: "reference",
                            original: {
                                scope: originalScopes[1].children[0],
                                values: [["42"]],
                                callsite: { sourceIndex: 1, line: 7, column: 2 },
                            },
                            children: [
                                {
                                    start: { line: 0, column: 0 },
                                    end: { line: 0, column: 16 },
                                    kind: "reference",
                                    original: {
                                        scope: originalScopes[0].children[0],
                                        values: [["42"]],
                                        callsite: { sourceIndex: 1, line: 3, column: 2 },
                                    },
                                }
                            ],
                        }
                    ],
                }
            ],
        },
        {
            start: { line: 0, column: 16 },
            end: { line: 0, column: 34 },
            kind: "reference",
            original: {
                scope: originalScopes[0],
                values: [["\"module_constant\""], [undefined]],
            },
            children: [
                {
                    start: { line: 0, column: 16 },
                    end: { line: 0, column: 34 },
                    kind: "reference",
                    original: {
                        scope: originalScopes[1].children[1],
                        values: [["null"]],
                        callsite: { sourceIndex: 1, line: 11, column: 0 },
                    },
                    children: [
                        {
                            start: { line: 0, column: 16 },
                            end: { line: 0, column: 34 },
                            kind: "reference",
                            original: {
                                scope: originalScopes[1].children[0],
                                values: [["null"]],
                                callsite: { sourceIndex: 1, line: 7, column: 2 },
                            },
                            children: [
                                {
                                    start: { line: 0, column: 16 },
                                    end: { line: 0, column: 34 },
                                    kind: "reference",
                                    original: {
                                        scope: originalScopes[0].children[0],
                                        values: [["null"]],
                                        callsite: { sourceIndex: 1, line: 3, column: 2 },
                                    },
                                }
                            ],
                        }
                    ],
                }
            ],
        }
    ]
};
test("decode scopes from sourcemap", () => {
    expect((0, decodeScopes_1.decodeOriginalScopes)(encodedOriginalScopes, scopeNames)).toStrictEqual(originalScopes);
    expect((0, decodeScopes_1.decodeGeneratedScopes)(encodedGeneratedScopes, scopeNames, originalScopes)).toStrictEqual(generatedScopes);
});
test("encode scopes to sourcemap", () => {
    const names = [];
    const encodedOriginal = originalScopes.map(scope => (0, encodeScopes_1.encodeOriginalScopes)(scope, names));
    const encodedGenerated = (0, encodeScopes_1.encodeGeneratedScopes)(generatedScopes, originalScopes, names);
    expect(encodedOriginal).toStrictEqual(encodedOriginalScopes);
    expect(encodedGenerated).toStrictEqual(encodedGeneratedScopes);
    expect(names).toStrictEqual(scopeNames);
});
test("original frames at column 1", () => {
    const debuggerScopes = [
        {
            // The global scope, we only show one example binding
            bindings: [
                { varname: "document", value: { objectId: 1 } }
            ]
        },
        {
            // The module scope
            bindings: []
        },
    ];
    expect((0, getOriginalFrames_1.getOriginalFrames)({ line: 0, column: 0 }, { sourceIndex: 0, line: 4, column: 4 }, generatedScopes, originalScopes, debuggerScopes)).toMatchInlineSnapshot(`
[
  {
    "location": {
      "column": 4,
      "line": 4,
      "sourceIndex": 0,
    },
    "name": "log",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": "module_constant",
            },
            "varname": "MODULE_CONSTANT",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": 42,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 2,
      "line": 3,
      "sourceIndex": 1,
    },
    "name": "inner",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": 42,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 2,
      "line": 7,
      "sourceIndex": 1,
    },
    "name": "outer",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": 42,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 0,
      "line": 10,
      "sourceIndex": 1,
    },
    "name": undefined,
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
    ],
  },
]
`);
});
test("original frames at column 18", () => {
    const debuggerScopes = [
        {
            // The global scope, we only show one example binding
            bindings: [
                { varname: "document", value: { objectId: 1 } }
            ]
        },
        {
            // The module scope
            bindings: []
        },
    ];
    expect((0, getOriginalFrames_1.getOriginalFrames)({ line: 1, column: 18 }, { sourceIndex: 0, line: 5, column: 5 }, generatedScopes, originalScopes, debuggerScopes)).toMatchInlineSnapshot(`
[
  {
    "location": {
      "column": 5,
      "line": 5,
      "sourceIndex": 0,
    },
    "name": "log",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": "module_constant",
            },
            "varname": "MODULE_CONSTANT",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": null,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 3,
      "line": 4,
      "sourceIndex": 1,
    },
    "name": "inner",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": null,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 3,
      "line": 8,
      "sourceIndex": 1,
    },
    "name": "outer",
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": null,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
  {
    "location": {
      "column": 1,
      "line": 12,
      "sourceIndex": 1,
    },
    "name": undefined,
    "scopes": [
      {
        "bindings": [
          {
            "value": {
              "objectId": 1,
            },
            "varname": "document",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "unavailable": true,
            },
            "varname": "Logger",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "inner",
          },
          {
            "value": {
              "unavailable": true,
            },
            "varname": "outer",
          },
        ],
      },
    ],
  },
]
`);
});
