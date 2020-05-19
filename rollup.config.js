import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import server from 'rollup-plugin-serve';

const isDev = process.env.NODE_ENV === 'development';
const extensions = ['.js', '.ts'];
const plugins = [
    resolve({
        extensions
    }),
    babel({
        babelHelpers: 'bundled',
        extensions
    }),
    terser()
];

if(isDev) {
    plugins.push(server({
        contentBase: ['dist', 'dev']
    }))
}

export default {
    input: 'src/index.ts',
    output: [{
        file: 'dist/index.es.js',
        sourcemap: true,
        format: 'es'
    }, {
        file: 'dist/index.umd.js',
        sourcemap: true,
        format: 'umd',
        name: 'Keybinding'
    }],
    plugins
};
