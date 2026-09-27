/**
 * Starters: alternative versions of this template (e.g. an artist portfolio).
 *
 * A starter lives in starters/<name>/:
 *   starter.json   { name, description, remove: [paths to delete before copying] }
 *   files/         files copied over the repository root (same paths as the template)
 *
 * Usage:
 *   npm run starter -- list
 *   npm run starter -- apply <name> [--keep] [--force]
 *   npm run starter -- verify [name ...]
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

interface Manifest {
  name: string;
  description: string;
  remove: string[];
}

const root = resolve(import.meta.dirname, '..');
const startersDir = join(root, 'starters');

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function starterNames(): string[] {
  if (!existsSync(startersDir)) return [];
  return readdirSync(startersDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(join(startersDir, entry.name, 'starter.json')),
    )
    .map((entry) => entry.name)
    .sort();
}

function readManifest(name: string): Manifest {
  const path = join(startersDir, name, 'starter.json');
  if (!existsSync(path)) {
    const available = starterNames();
    fail(`Unknown starter "${name}". Available: ${available.join(', ') || 'none'}.`);
  }
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as Partial<Manifest>;
  if (!manifest.name || !manifest.description || !Array.isArray(manifest.remove)) {
    fail(`${relative(root, path)} needs "name", "description", and a "remove" array.`);
  }
  return manifest as Manifest;
}

/** Resolves a manifest path and refuses anything outside the repository. */
function insideRoot(path: string): string {
  const full = resolve(root, path);
  if (full === root || !full.startsWith(root + '/'))
    fail(`Refusing to touch path outside the project: ${path}`);
  return full;
}

function hasUncommittedChanges(): boolean {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim() !== '';
}

function list() {
  const names = starterNames();
  if (names.length === 0) {
    console.log('No starters in this project (starters/ is empty or was removed).');
    return;
  }
  console.log('Available starters:\n');
  for (const name of names) {
    const manifest = readManifest(name);
    console.log(`  ${name.padEnd(12)} ${manifest.name}: ${manifest.description}`);
  }
  console.log('\nApply one with: npm run starter -- apply <name>');
}

function apply(name: string | undefined, flags: Set<string>) {
  if (!name) fail('Usage: npm run starter -- apply <name> [--keep] [--force]');
  const manifest = readManifest(name);

  if (!flags.has('--force') && hasUncommittedChanges()) {
    fail('You have uncommitted changes. Commit or stash them first, or pass --force.');
  }

  for (const path of manifest.remove) rmSync(insideRoot(path), { recursive: true, force: true });
  cpSync(join(startersDir, name, 'files'), root, { recursive: true });
  if (!flags.has('--keep')) rmSync(startersDir, { recursive: true, force: true });

  console.log(`\n✔ Applied the "${manifest.name}" starter.\n`);
  console.log('Next steps:');
  console.log('  1. npm run dev, and review the site at http://localhost:4321');
  console.log(
    '  2. Edit src/site.config.ts and src/styles/tokens.css, replace example content and images',
  );
  console.log('  3. Update md/PROJECT.md and md/STATUS.md for this website (see md/README.md)');
  console.log('  4. npm run verify, then commit');
}

function run(command: string, args: string[], cwd: string) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });
  return result.status === 0;
}

/** Applies each starter in a temporary copy and runs the checks there. */
function verify(names: string[]) {
  const targets = names.length > 0 ? names : starterNames();
  if (targets.length === 0) {
    console.log('No starters to verify.');
    return;
  }
  const skip = new Set([
    'node_modules',
    '.git',
    'dist',
    '.astro',
    'test-results',
    'playwright-report',
  ]);
  const failed: string[] = [];

  for (const name of targets) {
    readManifest(name);
    console.log(`\n━━ Verifying starter "${name}" ━━`);
    const dir = mkdtempSync(join(tmpdir(), `starter-${name}-`));
    cpSync(root, dir, {
      recursive: true,
      filter: (source) => !skip.has(relative(root, source).split('/')[0]),
    });
    symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'), 'dir');

    const ok =
      run('node', ['scripts/starter.ts', 'apply', name, '--force'], dir) &&
      run('npm', ['run', 'check'], dir) &&
      run('npm', ['run', 'lint'], dir) &&
      run('npm', ['run', 'test:unit'], dir) &&
      run('npm', ['run', 'test:e2e'], dir);

    if (ok) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`\n✔ Starter "${name}" passed.`);
    } else {
      failed.push(name);
      console.error(
        `\n✖ Starter "${name}" failed. The applied copy is kept for inspection: ${dir}`,
      );
    }
  }

  if (failed.length > 0) fail(`Failed starters: ${failed.join(', ')}`);
}

const [command, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((arg) => arg.startsWith('--')));
const args = rest.filter((arg) => !arg.startsWith('--'));

switch (command) {
  case 'list':
  case undefined:
    list();
    break;
  case 'apply':
    apply(args[0], flags);
    break;
  case 'verify':
    verify(args);
    break;
  default:
    fail(`Unknown command "${command}". Use list, apply, or verify.`);
}
