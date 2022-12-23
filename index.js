"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const figlet_1 = __importDefault(require("figlet"));
const nanospinner_1 = __importDefault(require("nanospinner"));
const index_cjs_1 = require("@santi100/coloring-lib/cjs/index.cjs");
const cjs_1 = require("@santi100/yt-dlib/cjs");
const commander_1 = require("commander");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const CLI_NAME = 'YouTube Downloader';
const CMD_NAME = 'youtube-downloader';
const VERSION = 'v1.0.0';
const VERBOSE_PROMPT = (0, index_cjs_1.coloring)('[VERBOSE]', 'cyan');
const ERR_CHAR = '✗';
const OK_CHAR = '✓';
const INFO_CHAR = '🛈';
const title = figlet_1.default.textSync(CLI_NAME);
const coloredTitle = (0, index_cjs_1.coloring)(title, 'red');
const createErrorPrompt = err => (0, index_cjs_1.coloring)(`${ERR_CHAR} An error has occurred. ${err}.`, 'red');
const createSuccessPrompt = msg => (0, index_cjs_1.coloring)(`${OK_CHAR} ${msg}.`, 'green');
const createInfoPrompt = msg => (0, index_cjs_1.coloring)(`${INFO_CHAR} ${msg}.`, 'cyan');
const program = (new commander_1.Command(CMD_NAME))
    .version(VERSION)
    .description('Download any YouTube video into an mp4 file!')
    .option('-v, --verbose', 'Enter verbose mode.')
    .parse(process.argv);
const { verbose } = program.opts();
console.clear();
console.log(coloredTitle);
async function main() {
    async function getURL() {
        if (verbose)
            console.log(`${VERBOSE_PROMPT} PHASE 1: Asking for link.`);
        const { rawLink } = await inquirer_1.default.prompt({
            name: 'rawLink',
            type: 'input',
            message: 'Please enter video link:'
        });
        return new URL(rawLink);
    }
    const [url, error] = (await getURL()
        .then(url => [url, null])
        .catch(err => [null, err]));
    if (error) {
        if (verbose)
            console.log(`${VERBOSE_PROMPT} Invalid URL.`);
        console.error(createErrorPrompt(error));
        return 1; // Error.
    }
    else {
        if (verbose)
            console.log(`${VERBOSE_PROMPT} PHASE 2: Download.`);
        const detailsSpinner = nanospinner_1.default.createSpinner('Fetching video ID...').start();
        const videoId = url.searchParams.get('v') || 'Video';
        detailsSpinner.stop().clear();
        const FILENAME = (0, path_1.resolve)(__dirname, `vid-${videoId}.mp4`);
        const fetchSpinner = nanospinner_1.default.createSpinner('Fetching video...').start();
        fetchSpinner.stop().clear();
        if (verbose)
            console.log(`${VERBOSE_PROMPT} PHASE 3: Writing to Disk.`);
        const videoSpinner = nanospinner_1.default.createSpinner('Writing video...').start();
        await (0, promises_1.writeFile)(FILENAME, (0, cjs_1.downloadVideo)(url));
        videoSpinner.stop().clear();
        console.log(createSuccessPrompt(`Successfully written ${FILENAME}`));
        return 0;
    }
}
async function readableToBuffer(readable) {
    return new Promise(async (resolve, reject) => {
        // readable.on('error', reject); readable.on('close', resolve);
        const chunks = [];
        for await (const chunk of readable)
            chunks.push(chunk);
        resolve(Buffer.concat(chunks));
        // readable.on('error', reject);
    });
}
main().then(process.exit).catch(e => {
    console.error(createErrorPrompt(e));
    if (verbose)
        throw e;
    process.exit(1);
});
