import { checkbox } from '@inquirer/prompts';
import { git } from './git';
import { GitError } from './errors/gitError';

class Add {
    constructor(private gitBase = git) {}

    public async run(workdir: string): Promise<void> {
        if (!this.gitBase.isInsideGitProject(workdir).ok)
            throw new GitError('Make sure you are calling commands from GIT project!');

        const statusResult = this.gitBase.ok(workdir, ['status', '--porcelain']);
        if (!statusResult.ok) throw new GitError(`Could not get git status: ${statusResult.out}`);

        const lines = statusResult.out.split('\n').filter(Boolean);
        if (lines.length === 0) throw new GitError('No changes to stage. Working tree is clean.');

        const choices = lines.map((line) => {
            const xy = line.slice(0, 2);
            const file = line.slice(3).trim();
            const staged = xy[0] !== ' ' && xy[0] !== '?';

            return {
                name: `${xy}  ${file}`,
                value: file,
                checked: staged,
            };
        });

        const selected = await checkbox({
            message: 'Select files to stage:',
            choices,
        });

        if (selected.length === 0) {
            console.log('No files selected. Nothing staged.');

            return;
        }

        const result = this.gitBase.ok(workdir, ['add', '--', ...selected]);
        if (!result.ok) throw new GitError(`Failed to stage files: ${result.out}`);

        console.log(`\n\x1b[32m✔ Staged ${selected.length} file(s):\x1b[0m`);
        selected.forEach((f) => console.log(`  ${f}`));
    }
}

export const add = new Add();
