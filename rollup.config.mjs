import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

const plugins = [
  commonjs(),
  typescript(),
];

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.js",
      format: "umd",
      name: "NetsBloxCloud",
    },
    plugins,
  },
];
