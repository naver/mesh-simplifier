import json from "@rollup/plugin-json";

const buildHelper = require("../config/build-helper");
const tsconfig = "tsconfig.json";

const plugins = [
  json(),
];

export default buildHelper([
  {
    name: "App",
    input: "./demo/src/index.ts",
    output: "./demo/dist/app.js",
    format: "umd",
    tsconfig,
    resolve: true,
    plugins,
  }
]);
