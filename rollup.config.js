import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import ts from "rollup-plugin-ts";
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'src/index.ts',
    output: {
      sourcemap: true,
      file: 'lib/index.js',
      format: 'es'
    },
    plugins: [
      ts(),
      resolve(),
      commonjs(),
      livereload(),
      sourcemaps(),
      serve({
        open: true,
        port: 8082,
        contentBase: ['examples', 'lib'],
      })
    ]
}
