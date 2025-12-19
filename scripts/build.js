// @ts-check

import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import minifyHtml from "@minify-html/node";

const EXEC_ASYNC = promisify(exec);
const SRC_DIR = "./src";
const DIST_DIR = "./dist";
const INDEX_HTML = "index.html";
const MAIN_JS = "main.js";
const MAIN_SCRIPT_INJECT_TEMPLATE = "{{mainscript}}";
const FAVICON_SVG = "favicon.svg";
const FAVICON_INJECT_TEMPLATE = "{{favicon}}";

await fs.mkdir(DIST_DIR, { recursive: true });

/**
 * @param {string} src
 * @param {string} dest
 */
async function compileJs(src, dest)
{
    if (path.extname(src) != ".js")
    {
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

/**
 * @param {string} htmlCode
 * @returns {Promise<string>}
 */
async function injectMainJs(htmlCode)
{
    const mainJsCode = await fs.readFile(
        path.join(DIST_DIR, MAIN_JS),
        { encoding: 'utf-8' }
    );

    await fs.rm(path.join(DIST_DIR, MAIN_JS));

    return htmlCode.replace(
        MAIN_SCRIPT_INJECT_TEMPLATE,
        // SAFETY: This code is immutable and does not depend on user input.
        // No XSS is possible unless code review goes awry. And even then,
        // this code runs on compile-time, not run-time.
        `<script>${mainJsCode.trim()}</script>`,
    );
}

/**
 * @param {string} htmlCode
 * @returns {Promise<string>}
 */
async function injectFavicon(htmlCode)
{
    let faviconCode = await fs.readFile(
        path.join(SRC_DIR, FAVICON_SVG),
        { encoding: 'utf-8' }
    );

    const PERCENT_ENCODING_MAP = [
        ['#', '%23']
    ];

    for (const [from, to] of PERCENT_ENCODING_MAP)
    {
        faviconCode = faviconCode.replaceAll(from, to);
    }

    return htmlCode.replace(
        FAVICON_INJECT_TEMPLATE,
        // SAFETY: This code is immutable and does not depend on user input.
        // No XSS is possible unless code review goes awry. And even then,
        // this code runs on compile-time, not run-time.
        `'data:image/svg+xml,${faviconCode}'`
    );
}

async function createHtml()
{
    const srcHtml = await fs.readFile(
        path.join(SRC_DIR, INDEX_HTML),
        { flag: 'r' }
    );

    const minHtmlBuf = minifyHtml.minify(
        srcHtml,
        {
            allow_noncompliant_unquoted_attribute_values: false,
            allow_optimal_entities: true,
            allow_removing_spaces_between_attributes: true,
            keep_closing_tags: false,
            keep_comments: false,
            keep_html_and_head_opening_tags: false,
            keep_input_type_text_attr: false,
            keep_ssi_comments: false,
            minify_css: true,
            minify_doctype: true,
            minify_js: false,
            preserve_brace_template_syntax: true,
            preserve_chevron_percent_template_syntax: false,
            remove_bangs: false,
            remove_processing_instructions: true,
        }
    );

    let minHtmlCode = minHtmlBuf.toString('utf-8');
    minHtmlCode = await injectMainJs(minHtmlCode);
    minHtmlCode = await injectFavicon(minHtmlCode);

    await fs.writeFile(
        path.join(DIST_DIR, INDEX_HTML),
        minHtmlCode
    );
}

/** @type {[string, string][]} */
const FILES_TO_COPY = [
    ["favicon.light.png", "l.png"],
    ["favicon.dark.png", "d.png"],
];

async function copyFiles()
{
    await Promise.all(FILES_TO_COPY.map(([src, dest]) =>
    {
        return fs.copyFile(
            path.join(SRC_DIR, src),
            path.join(DIST_DIR, dest),
        )
    }))
}

await Promise.all([
    copyFiles(),
    createHtml(),
]);