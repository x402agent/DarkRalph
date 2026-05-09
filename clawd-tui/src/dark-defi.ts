import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

export interface DarkDefiStatus {
  root: string;
  exists: boolean;
  terminalExists: boolean;
  protocolExists: boolean;
  sdkExists: boolean;
  docsExists: boolean;
  packageName?: string;
  terminalPackageName?: string;
  protocolVersion?: string;
  hasRootEnv: boolean;
  hasTerminalEnv: boolean;
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getDarkDefiStatus(root: string): DarkDefiStatus {
  const terminal = join(root, 'terminal');
  const protocol = join(root, 'Protocol');
  const sdk = join(root, 'sdk');
  const docs = join(root, 'docs');
  const rootPkg = readJson(join(root, 'package.json'));
  const terminalPkg = readJson(join(terminal, 'package.json'));
  const protocolIndex = existsSync(join(protocol, 'index.ts'));

  return {
    root,
    exists: existsSync(root),
    terminalExists: existsSync(terminal),
    protocolExists: existsSync(protocol) && protocolIndex,
    sdkExists: existsSync(sdk),
    docsExists: existsSync(docs),
    packageName: typeof rootPkg?.name === 'string' ? rootPkg.name : undefined,
    terminalPackageName: typeof terminalPkg?.name === 'string' ? terminalPkg.name : undefined,
    protocolVersion: typeof rootPkg?.version === 'string' ? rootPkg.version : undefined,
    hasRootEnv: existsSync(join(root, '.env')),
    hasTerminalEnv: existsSync(join(terminal, '.env')),
  };
}

export function darkDefiPaths(root: string): Record<string, string> {
  return {
    root,
    terminal: join(root, 'terminal'),
    protocol: join(root, 'Protocol'),
    sdk: join(root, 'sdk'),
    docs: join(root, 'docs'),
    quickstart: join(root, 'QUICKSTART.md'),
    architecture: join(root, 'ARCHITECTURE.md'),
    x402: join(root, 'DARK_X402_TERMINAL.md'),
    terminalReadme: join(root, 'terminal', 'README.md'),
  };
}

export async function runDarkDefiScript(root: string, script: 'build' | 'start'): Promise<number> {
  const cwd = join(root, 'terminal');
  if (!existsSync(cwd)) throw new Error(`Dark terminal directory not found: ${cwd}`);

  return await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script], {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}
