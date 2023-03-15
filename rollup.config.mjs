import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [commonjs(), nodeResolve(), typescript()];

export default [
  {
    input: 'src/client.ts',
    output: {
      file: 'dist/client.js',
      format: 'umd',
      name: 'Cloud'
    },
    plugins,
    preferBuiltins: true,
  },
];
