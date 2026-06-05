import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';

const program = new Command();

program
  .name('node24-ci-guard')
  .description('Install a self-healing Node 24 CI workflow into any repo')
  .version('1.0.0');

program
  .command('install')
  .description('Copy .github/workflows/ci.yml into the target repo')
  .option('-d, --dir <path>', 'Target repo directory', process.cwd())
  .option('--force', 'Overwrite existing workflow')
  .action(async (opts) => {
    const target = path.resolve(opts.dir);
    const workflowDir = path.join(target, '.github', 'workflows');
    const templatePath = path.join(__dirname, '..', 'templates', 'ci.yml.hbs');
    
    if (!await fs.pathExists(templatePath)) {
      console.error(`Template not found: ${templatePath}`);
      process.exit(1);
    }
    
    const template = await fs.readFile(templatePath, 'utf-8');
    const compiled = Handlebars.compile(template);
    const output = compiled({ nodeVersion: '24' });
    
    await fs.ensureDir(workflowDir);
    const outPath = path.join(workflowDir, 'ci.yml');
    
    if (await fs.pathExists(outPath) && !opts.force) {
      console.error(`Workflow exists at ${outPath}. Use --force to overwrite.`);
      process.exit(1);
    }
    
    await fs.writeFile(outPath, output);
    console.log(`Installed Node 24 CI workflow to ${outPath}`);
  });

program.parse();
