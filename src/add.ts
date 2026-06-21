import { checkbox } from '@inquirer/prompts';
import { git } from './git';
import { GitError } from './errors/gitError';

interface FileEntry {
    file: string;
    status: string;
    staged: boolean;
}

type DirectoryMap = Map<string, FileEntry[]>;

function parseStatusLines(lines: string[]): { root: FileEntry[]; dirs: DirectoryMap } {
    const root: FileEntry[] = [];
    const dirs: DirectoryMap = new Map();

    for (const line of lines) {
        const xy = line.slice(0, 2);
        const file = line.slice(3).trim();
        const staged = xy[0] !== ' ' && xy[0] !== '?';
        const status = xy.trim() || '??';
        const entry: FileEntry = { file, status, staged };

        const slashIdx = file.indexOf('/');
        if (slashIdx === -1 || slashIdx === file.length - 1) {
            root.push(entry);
        } else {
            const dir = file.slice(0, slashIdx);
            if (!dirs.has(dir)) dirs.set(dir, []);
            dirs.get(dir)!.push(entry);
        }
    }

    return { root, dirs };
}

type Choice = { name: string; value: string; checked: boolean };

function buildChoices(root: FileEntry[], dirs: DirectoryMap) {
    const choices: Choice[] = [];

    for (const entry of root) {
        choices.push({ name: `${entry.status}  ${entry.file}`, value: entry.file, checked: entry.staged });
    }

    for (const [dir, entries] of dirs) {
        const allStaged = entries.every((e) => e.staged);
        choices.push({ name: `${dir}/`, value: `${dir}/`, checked: allStaged });
        for (const entry of entries) {
            choices.push({
                name: `    ${entry.status}  ${entry.file}`,
                value: entry.file,
                checked: allStaged || entry.staged,
            });
        }
    }

    return choices;
}

function expandSelection(selected: string[], dirs: DirectoryMap): string[] {
    const result: string[] = [];
    for (const value of selected) {
        if (value.endsWith('/')) {
            const dirName = value.slice(0, -1);
            const children = dirs.get(dirName);
            if (children) {
                children.forEach((e) => result.push(e.file));
            } else {
                result.push(value);
            }
        } else {
            result.push(value);
        }
    }

    return [...new Set(result)];
}

class Add {
    constructor(private gitBase = git) {}

    public async run(workdir: string): Promise<void> {
        if (!this.gitBase.isInsideGitProject(workdir).ok)
            throw new GitError('Make sure you are calling commands from GIT project!');

        const statusResult = this.gitBase.ok(workdir, ['status', '--porcelain']);
        if (!statusResult.ok) throw new GitError(`Could not get git status: ${statusResult.out}`);

        const lines = statusResult.out.split('\n').filter(Boolean);
        if (lines.length === 0) throw new GitError('No changes to stage. Working tree is clean.');

        const { root, dirs } = parseStatusLines(lines);
        const choices = buildChoices(root, dirs);

        const selected = await checkbox({
            message: 'Select files to stage:',
            choices,
        });

        if (selected.length === 0) {
            console.log('No files selected. Nothing staged.');

            return;
        }

        const toStage = expandSelection(selected, dirs);
        const result = this.gitBase.ok(workdir, ['add', '--', ...toStage]);
        if (!result.ok) throw new GitError(`Failed to stage files: ${result.out}`);

        console.log(`\n\x1b[32m✔ Staged ${toStage.length} file(s):\x1b[0m`);
        toStage.forEach((f) => console.log(`  ${f}`));
    }
}

export const add = new Add();
