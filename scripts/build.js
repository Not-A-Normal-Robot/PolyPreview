// @ts-check

import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const EXEC_ASYNC = promisify(exec);
const SRC_DIR = "./src";
const DIST_DIR = "./dist";

await fs.mkdir(DIST_DIR, { recursive: true });

/**
 * @param {string} src
 * @param {string} dest
 */
async function compileJs(src, dest)
{
    if (path.extname(src) != ".js")
    {
        await fs.copyFile(src, dest);
        return;
    }
    await EXEC_ASYNC(`google-closure-compiler --compilation_level ADVANCED_OPTIMIZATIONS --js=${src} --js_output_file=${dest}`);
}

let promises =
    (await fs.readdir(SRC_DIR))
        .map((file) =>
        {
            const src = path.join(SRC_DIR, file);
            const dest = path.join(DIST_DIR, file);
            return compileJs(src, dest);
        });

await Promise.all(promises);

async function createHtml()
{
    // let html = 
}