import { git } from './git';
import { GitError } from './errors/gitError';

class Add {
    constructor(private gitBase = git) {}

    public async run(workdir: string): Promise<void> {
        if (!this.gitBase.isInsideGitProject(workdir).ok)
            throw new GitError('Make sure you are calling commands from GIT project!');

        // TODO: implement interactive git add
        throw new Error('Not implemented');
    }
}

export const add = new Add();
