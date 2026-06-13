import { rawlist, input } from '@inquirer/prompts';
import { git } from './git';
import { GitError } from './errors';

class Commit {
    constructor(private gitBase = git) {}

    private async promptMessage(workdir: string): Promise<string> {
        const wrap = (s: string) => s ? `(${s})` : '';

        const type = await rawlist({
            message: 'Select commit type:',
            choices: ['feat', 'test', 'fix', 'chore', 'refactor', 'docs', 'style'],
        });

        const scopeAnswer = await rawlist({
            message: 'Select commit scope:',
            choices: ['branch', 'e2e', 'api', 'omit', 'custom'],
        });

        let scope = '';
        if (scopeAnswer === 'branch') {
            const branch = this.gitBase.ok(workdir, ['branch', '--show-current']);
            if (!branch.ok) throw new GitError(`Could not get branch name: ${branch.out}`);
            scope = wrap(branch.out);
        } else if (scopeAnswer === 'custom') {
            scope = wrap(await input({ message: 'Provide custom scope:' }));
        }

        const description = await input({
            message: 'Provide commit description:',
            transformer: (v) => `\x1b[32m[${v.length}/75]\x1b[0m ${v}`,
            validate: (v) => v.trim().length > 5 || 'Description should be 5 characters long!',
        });

        return `${type}${scope}: ${description.trim()}`;
    }

    public async run(workdir: string): Promise<void> {
        if (!this.gitBase.isInsideGitProject(workdir).ok)
            throw new GitError('Make sure you are calling commands from GIT project!');

        const staged = this.gitBase.ok(workdir, ['diff', '--cached', '--name-only']);
        if (!staged.ok || staged.out.trim() === '')
            throw new GitError('No staged files. Stage your changes with `git add` first.');

        const message = await this.promptMessage(workdir);

        const result = this.gitBase.ok(workdir, ['commit', '-m', message]);
        if (!result.ok) throw new GitError(`Failed to commit: ${result.out}`);

        const log = this.gitBase.ok(workdir, ['log', '-1', '--pretty=format:%h %s']);
        console.log(`\n\x1b[32m✔ Committed:\x1b[0m ${log.out}`);
    }
}

export const commit = new Commit();
