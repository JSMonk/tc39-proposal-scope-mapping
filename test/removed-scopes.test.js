"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decodeScopes_1 = require("../src/decodeScopes");
const encodeScopes_1 = require("../src/encodeScopes");
const getOriginalFrames_1 = require("../src/getOriginalFrames");
/**
Taken from https://github.com/tc39/source-map-rfc/issues/37#issuecomment-1699356967

Original source:
```javascript
0 {
1   let x = 1;
2   console.log(x);
3   {
4     let x = 2;
5     console.log(x);
6   }
7   console.log(x);
8 }
```

Generated source:
```javascript
0 {
1   var x1 = 1;
2   console.log(x1);
3   var x2 = 2;
4   console.log(x2);
5   console.log(x1);
6 }
```
*/
const scopeNames = ["x", "x1", "x2"];
const encodedOriginalScopes = ["AACA,AAIAA,GEIAA,GG,EC,AC"];
const encodedGeneratedScopes = ",ACCAA,AICACC;;;EKCACE;kB;;C,A";
const originalScopes = [
    {
        start: { sourceIndex: 0, line: 0, column: 0 },
        end: { sourceIndex: 0, line: 8, column: 1 },
        kind: "module",
        variables: [],
        children: [
            {
                start: { sourceIndex: 0, line: 0, column: 0 },
                end: { sourceIndex: 0, line: 8, column: 1 },
                variables: ["x"],
                kind: "block",
                children: [
                    {
                        start: { sourceIndex: 0, line: 3, column: 2 },
                        end: { sourceIndex: 0, line: 6, column: 3 },
                        kind: "block",
                        variables: ["x"],
                    }
                ],
            }
        ],
    }
];
const generatedScopes = {
    start: { line: 0, column: 0 },
    end: { line: 6, column: 1 },
    kind: "module",
    original: {
        scope: originalScopes[0],
        values: [],
    },
    children: [
        {
            start: { line: 0, column: 0 },
            end: { line: 6, column: 1 },
            kind: "block",
            original: {
                scope: originalScopes[0].children[0],
                values: [["x1"]],
            },
            children: [
                {
                    start: { line: 3, column: 2 },
                    end: { line: 4, column: 18 },
                    kind: "reference",
                    original: {
                        scope: originalScopes[0].children[0].children[0],
                        values: [["x2"]],
                    },
                }
            ],
        }
    ],
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
test("original frames at line 5", () => {
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
        {
            // The block scope
            bindings: [
                { varname: "x1", value: { value: 1 } },
                { varname: "x2", value: { value: 2 } },
            ]
        },
    ];
    expect((0, getOriginalFrames_1.getOriginalFrames)({ line: 4, column: 2 }, { sourceIndex: 0, line: 5, column: 4 }, generatedScopes, originalScopes, debuggerScopes)).toMatchInlineSnapshot(`
[
  {
    "location": {
      "column": 4,
      "line": 5,
      "sourceIndex": 0,
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
        "bindings": [],
      },
      {
        "bindings": [
          {
            "value": {
              "value": 1,
            },
            "varname": "x",
          },
        ],
      },
      {
        "bindings": [
          {
            "value": {
              "value": 2,
            },
            "varname": "x",
          },
        ],
      },
    ],
  },
]
`);
});
