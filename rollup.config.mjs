import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

const plugins = [
  commonjs(),
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
