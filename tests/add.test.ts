import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

jest.mock('@inquirer/prompts');
import { checkbox } from '@inquirer/prompts';
import { add } from '../src/add';

const mockedCheckbox = checkbox as unknown as {
    mockResolvedValue: (v: string[]) => void;
    mock: { calls: { choices: { name: string; value: string }[] }[][] };
};

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

    it('stages a single root-level file', async () => {
        writeFileSync(join(repoDir, 'foo.ts'), 'const x = 1;');
        writeFileSync(join(repoDir, 'bar.ts'), 'const y = 2;');

        mockedCheckbox.mockResolvedValue(['foo.ts']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['foo.ts']);
    });

    it('stages multiple root-level files', async () => {
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

    it('shows untracked directory as a root-level entry', async () => {
        mkdirSync(join(repoDir, 'src'));
        writeFileSync(join(repoDir, 'src', 'a.ts'), '');
        writeFileSync(join(repoDir, 'root.ts'), '');

        mockedCheckbox.mockResolvedValue([]);

        await add.run(repoDir);

        const callArg = mockedCheckbox.mock.calls[0]![0]!;
        const choices = callArg.choices;
        const names = choices.filter((c) => 'name' in c).map((c) => c.name);

        expect(names).toContain('??  root.ts');
        expect(names).toContain('??  src/');
    });

    it('stages entire untracked directory when its entry is selected', async () => {
        mkdirSync(join(repoDir, 'src'));
        writeFileSync(join(repoDir, 'src', 'a.ts'), '');
        writeFileSync(join(repoDir, 'src', 'b.ts'), '');

        mockedCheckbox.mockResolvedValue(['src/']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['src/a.ts', 'src/b.ts']);
    });

    it('shows directory checkbox and indented file entries for tracked modified files', async () => {
        mkdirSync(join(repoDir, 'src'));
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v1');
        execFileSync('git', ['add', '.'], { cwd: repoDir });
        execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir });
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v2');
        writeFileSync(join(repoDir, 'src', 'b.ts'), 'new');

        mockedCheckbox.mockResolvedValue([]);

        await add.run(repoDir);

        const callArg = mockedCheckbox.mock.calls[0][0];
        const choices = callArg.choices;
        const names = choices.filter((c) => 'name' in c).map((c) => c.name);
        const values = choices.filter((c) => 'value' in c).map((c) => c.value);

        expect(values).toContain('src/');
        expect(names.some((n) => n.includes('src/a.ts') && n.startsWith('    '))).toBe(true);
        expect(names.some((n) => n.includes('src/b.ts') && n.startsWith('    '))).toBe(true);
    });

    it('stages all files in directory when directory checkbox is selected', async () => {
        mkdirSync(join(repoDir, 'src'));
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v1');
        writeFileSync(join(repoDir, 'src', 'b.ts'), 'v1');
        execFileSync('git', ['add', '.'], { cwd: repoDir });
        execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir });
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v2');
        writeFileSync(join(repoDir, 'src', 'b.ts'), 'v2');

        mockedCheckbox.mockResolvedValue(['src/']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['src/a.ts', 'src/b.ts']);
    });

    it('deduplicates when both directory and individual file are selected', async () => {
        mkdirSync(join(repoDir, 'src'));
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v1');
        writeFileSync(join(repoDir, 'src', 'b.ts'), 'v1');
        execFileSync('git', ['add', '.'], { cwd: repoDir });
        execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir });
        writeFileSync(join(repoDir, 'src', 'a.ts'), 'v2');
        writeFileSync(join(repoDir, 'src', 'b.ts'), 'v2');

        mockedCheckbox.mockResolvedValue(['src/', 'src/a.ts']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['src/a.ts', 'src/b.ts']);
    });

    it('stages a mix of root files and directory files', async () => {
        mkdirSync(join(repoDir, 'lib'));
        writeFileSync(join(repoDir, 'index.ts'), '');
        writeFileSync(join(repoDir, 'lib', 'util.ts'), '');
        execFileSync('git', ['add', '.'], { cwd: repoDir });
        execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir });
        writeFileSync(join(repoDir, 'index.ts'), 'changed');
        writeFileSync(join(repoDir, 'lib', 'util.ts'), 'changed');

        mockedCheckbox.mockResolvedValue(['index.ts', 'lib/util.ts']);

        await add.run(repoDir);

        expect(stagedFiles(repoDir)).toEqual(['index.ts', 'lib/util.ts']);
    });
});
