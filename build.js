import * as cps from 'node:child_process';
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
}
