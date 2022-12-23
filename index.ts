import inquirer from 'inquirer';
import figlet from 'figlet';
import nanospinner from 'nanospinner';
import { coloring } from '@santi100/coloring-lib/cjs/index.cjs';
import { downloadVideo } from '@santi100/yt-dlib/cjs';
import { Command } from 'commander';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const CLI_NAME = 'YouTube Downloader';
const CMD_NAME = 'youtube-downloader';
const VERSION = 'v1.0.0';
const VERBOSE_PROMPT = coloring('[VERBOSE]', 'cyan');
const ERR_CHAR = '✗';
const OK_CHAR = '✓';
const INFO_CHAR = '🛈';

type PromptFunction = (msg: unknown) => string;
type ErrorFunction = (err: Error | string) => string;
type Readable = import('stream').Readable;

const title = figlet.textSync(CLI_NAME);
const coloredTitle = coloring(title, 'red');
const createErrorPrompt: ErrorFunction
 = err => coloring(`${ERR_CHAR} An error has occurred. ${err}.`, 'red');
const createSuccessPrompt: PromptFunction
 = msg => coloring(`${OK_CHAR} ${msg}.`, 'green');
const createInfoPrompt: PromptFunction
 = msg => coloring(`${INFO_CHAR} ${msg}.`, 'cyan');

const program = (new Command(CMD_NAME))
.version(VERSION)
.description('Download any YouTube video into an mp4 file!')
.option('-v, --verbose', 'Enter verbose mode.')
.parse(process.argv);
const { verbose } = program.opts();

console.clear();
console.log(coloredTitle);

async function main(): Promise<0 | 1> {
    async function getURL() {
        if (verbose) console.log(`${VERBOSE_PROMPT} PHASE 1: Asking for link.`);
        const { rawLink } = await inquirer.prompt({
            name: 'rawLink',
            type: 'input',
            message: 'Please enter video link:'
        });
        return new URL(rawLink);
    }
    const [url, error] = (await getURL()
    .then(url => [url, null])
    .catch(err => [null, err])) as [URL, null] | [null, Error];

    if (error) {
        if (verbose) console.log(`${VERBOSE_PROMPT} Invalid URL.`);
        console.error(createErrorPrompt(error));
        return 1; // Error.
    } else {
        if (verbose) console.log(`${VERBOSE_PROMPT} PHASE 2: Download.`);
        const detailsSpinner = nanospinner.createSpinner('Fetching video ID...').start();
        const videoId = url.searchParams.get('v') || 'Video';
        detailsSpinner.stop().clear();
        const FILENAME = resolve(__dirname, `vid-${videoId}.mp4`);
        const fetchSpinner = nanospinner.createSpinner('Fetching video...').start();
        fetchSpinner.stop().clear();
        if (verbose) console.log(`${VERBOSE_PROMPT} PHASE 3: Writing to Disk.`);
        const videoSpinner = nanospinner.createSpinner('Writing video...').start();
        await writeFile(FILENAME, downloadVideo(url));
        videoSpinner.stop().clear();
        console.log(createSuccessPrompt(`Successfully written ${FILENAME}`));
        
        return 0;
    }

}

async function readableToBuffer(readable: Readable): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        // readable.on('error', reject); readable.on('close', resolve);
        const chunks: Buffer[] = []
            for await (const chunk of readable) 
                chunks.push(chunk);
            
            resolve(Buffer.concat(chunks));
        // readable.on('error', reject);
    })
}

main().then(process.exit).catch(e => {
    console.error(createErrorPrompt(e));
    if (verbose) throw e;
    process.exit(1);
})

