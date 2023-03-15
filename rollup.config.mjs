import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const plugins = [
  commonjs(),
  nodeResolve({
    preferBuiltins: true,
  }),
  json(),
  typescript(),
];

export default [
  {
    input: "src/client.ts",
    output: {
      file: "dist/client.js",
      format: "umd",
      name: "Cloud",
      exports: "named",
    },
    plugins,
  },
];
