import * as cps from 'node:child_process';
<<<<<<< HEAD
import * as ps from 'node:process';

const consumerRoot = process.env.CONSUMER_ROOT;
const args = ps.argv.slice(2);

if (args.includes('--link')) {
  cps.execSync('pnpm link --dir ' + consumerRoot);
  console.log('\x1b[36m%s\x1b[0m', 'Linked to ' + consumerRoot);
}
if (args.includes('--bundle')) {
  cps.execSync(
    'esbuild src/chessground.ts --bundle --format=esm --outfile=' +
      consumerRoot +
      '/node_modules/chessground/dist/chessground.min.js',
  );
  console.log(
    '\x1b[32m%s\x1b[0m',
    'Compiled and built ' + consumerRoot + '/node_modules/chessground/dist/chessground.min.js',
  );
=======

const red = '\x1b[31m%s\x1b[0m';
const green = '\x1b[32m%s\x1b[0m';
const cyan = '\x1b[36m%s\x1b[0m';

const linkedProject = process.env.LINKED_PROJECT_PATH;
if (!linkedProject) {
  console.error(red, 'LINKED_PROJECT not set');
  process.exit(1);
}
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(red, 'No arguments provided');
  process.exit(1);
}

if (args.includes('--link')) {
  cps.execSync(`pnpm link --dir ${linkedProject}`, { stdio: 'inherit' });
  console.log(cyan, `ready to be linked from ${linkedProject}.`);
}

if (args.includes('--bundle')) {
  cps.execSync(
    `esbuild src/chessground.ts --bundle --format=esm --outfile=${linkedProject}/node_modules/chessground/dist/chessground.min.js`,
    { stdio: 'inherit' },
  );
  console.log(green, `compiled and built ${linkedProject}/node_modules/chessground/dist/chessground.min.js`);
>>>>>>> origin/master
}
