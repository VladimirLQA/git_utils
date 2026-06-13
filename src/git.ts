import { execFileSync } from 'child_process';

class Git {
    private call(workdir: string, args: string[]): string {
        return execFileSync('git', args, { cwd: workdir, encoding: 'utf8', stdio: 'pipe' }).trim();
    }

    public ok(workdir: string, args: string[]): { ok: boolean; out: string } {
        try {
            return { ok: true, out: this.call(workdir, args) };
        } catch (e) {
            const err = e as {
                stderr?: Buffer | string;
                stdout?: Buffer | string;
                message: string;
            };
            const stderr = typeof err.stderr === 'string' ? err.stderr : (err.stderr?.toString() ?? '');
            const stdout = typeof err.stdout === 'string' ? err.stdout : (err.stdout?.toString() ?? '');

            return { ok: false, out: (stderr || stdout || err.message).trim() };
        }
    }

    public isInsideGitProject(workdir: string) {
        return this.ok(workdir, ['rev-parse', '--is-inside-work-tree']);
    }
}

export const git = new Git();

