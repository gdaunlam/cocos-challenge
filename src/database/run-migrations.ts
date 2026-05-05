import * as dotenv from 'dotenv';
import { spawn } from 'child_process';
import { join } from 'path';

dotenv.config({ path: `.envs/.${process.env.NODE_ENV || 'development'}` });

export async function runMigrations(): Promise<void> {
  const runMigrationsFlag = process.env.RUN_MIGRATIONS === 'true';

  if (!runMigrationsFlag) {
    console.log('Migrations skipped: RUN_MIGRATIONS is not set to true');
    return;
  }

  return new Promise((resolve, reject) => {
    const typeormPath = join(process.cwd(), 'node_modules', 'typeorm', 'cli.js');
    const configPath = join(process.cwd(), 'typeorm-cli.config.ts');

    const child = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', typeormPath, 'migration:run', '-d', configPath], {
      stdio: 'inherit',
      cwd: join(__dirname, '..', '..'),
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
