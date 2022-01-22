import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import ts from "rollup-plugin-ts";

export default {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'es'
    },
    plugins: [
      ts(),
      resolve(),
      commonjs(),
      livereload(),
      serve({
        open: true,
        port: 8082,
        contentBase: ['examples', 'lib'],
      })
    ]
}