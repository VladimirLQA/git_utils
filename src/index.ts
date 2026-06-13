import path from 'path';
import { commit } from './commit';
import { ExitPromptError } from './errors';
import { add } from './add';

const command = path.basename(process.argv[1] ?? '');

(async () => {
    const workdir = process.cwd();

    switch (command) {
        case 'gicm': await commit.run(workdir); break;
        case 'gia':  await add.run(workdir); break;
        default: console.log(`Unknown command: ${command}`);
    }
})().catch((error: unknown) => {
    if (error instanceof ExitPromptError) {
        console.log('👋 until next time!');
    } else if (error instanceof Error) {
        console.error(`❌ ${error.message}`);
        process.exitCode = 1;
    } else {
        console.error('Unexpected error:', error);
        process.exitCode = 1;
    }
});

