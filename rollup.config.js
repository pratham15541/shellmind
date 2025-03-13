import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    banner: '#!/usr/bin/env node', // Ensure CLI compatibility
  },
  plugins: [
    resolve({
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    esbuild({
      target: 'esnext', // Set the target to 'esnext'
      sourceMap: true, // Enable sourcemaps
      minify: true, // Enable minification --minification increases the build time sometimes
    }),
  ],
  external: [
    'fs',
    'path',
    'os',
    'chalk',
    'ora',
    '@inquirer/prompts',
    'crypto',
    'figlet',
    'chalk-animation',
    'commander',
    'cli-html',
    'inquirer-file-selector',
  ], // Mark built-in and installed modules as external
};
