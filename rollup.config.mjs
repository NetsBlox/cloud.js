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
      exports: "default",
    },
    plugins,
  },
  {
    input: "src/api.ts",
    output: {
      file: "dist/api.js",
      format: "umd",
      name: "NetsBloxApi",
      exports: "default",
    },
    plugins,
  },
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
