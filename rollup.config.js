const buildHelper = require("./config/build-helper");

export const name = "MeshSimplifier";
export const fileName = "mesh-simplifier";
const external = {
  three: "THREE",
};
const tsconfig = "tsconfig.json";

const plugins = [];

export default buildHelper([
  {
    name,
    input: "./src/index.umd.ts",
    output: `./dist/${fileName}.js`,
    format: "umd",
    tsconfig,
    external,
    plugins,
  },
  {
    name,
    input: "./src/index.umd.ts",
    output: `./dist/${fileName}.min.js`,
    format: "umd",
    tsconfig,
    external,
    uglify: true,
    plugins,
  },
  {
    input: "./src/index.ts",
    output: `./dist/${fileName}.esm.js`,
    format: "esm",
    tsconfig,
    external,
    exports: "named",
    plugins,
  },
]);
