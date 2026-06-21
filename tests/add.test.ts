import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

jest.mock('@inquirer/prompts');
import { checkbox } from '@inquirer/prompts';
import { add } from '../src/add';

const mockedCheckbox = jest.mocked(checkbox);

function initRepo(): string {
    const dir = mkdtempSync(join(tmpdir(), 'git-add-test-'));
    execFileSync('git', ['init'], { cwd: dir });
    execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });

    return dir;
}

function cleanup(dir: string) {
    rmSync(dir, { recursive: true, force: true });
}

function stagedFiles(dir: string): string[] {
    return execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: dir, encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
}

describe('git add', () => {
    let repoDir: string;

    beforeEach(() => {
        repoDir = initRepo();
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup(repoDir);
    });

    it('stages the files selected in the checkbox prompt', async () => {
        writeFileSync(join(repoDir, 'foo.ts'), 'const x = 1;');
        writeFileSync(join(repoDir, 'bar.ts'), 'const y = 2;');

        mockedCheckbox.mockResolvedValue(['foo.ts']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['foo.ts']);
    });

    it('stages multiple selected files', async () => {
        writeFileSync(join(repoDir, 'a.ts'), '');
        writeFileSync(join(repoDir, 'b.ts'), '');
        writeFileSync(join(repoDir, 'c.ts'), '');

        mockedCheckbox.mockResolvedValue(['a.ts', 'b.ts', 'c.ts']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['a.ts', 'b.ts', 'c.ts']);
    });

    it('stages nothing and exits cleanly when no files are selected', async () => {
        writeFileSync(join(repoDir, 'foo.ts'), 'const x = 1;');

        mockedCheckbox.mockResolvedValue([]);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual([]);
    });
});
