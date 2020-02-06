import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import html from '@rollup/plugin-html';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;
const assetsPrefix = !!production ? '/virus-nCoV': '';

const templateFunc = ({
  title,
  publicPath,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>

  <title>${title}</title>

  <link rel='icon' type='image/png' href='${publicPath}/favicon.png'>
  <link rel='stylesheet' href='${publicPath}/global.css'>
  <link rel='stylesheet' href='${publicPath}/build/bundle.css'>
  <script defer src='${publicPath}/build/bundle.js'></script>
</head>

<body>
</body>
</html>
`

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => {
        css.write('public/build/bundle.css');
      }
    }),
    json(),
    production && html({
      publicPath: assetsPrefix,
      title: 'nCoV-Graph',
      template: templateFunc,
    }),

    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    !production && serve(),
    !production && livereload('public'),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}
