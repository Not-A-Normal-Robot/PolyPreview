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

async function createHtml()
{
    const srcHtml = await fs.readFile(
        path.join(SRC_DIR, INDEX_HTML),
        { flag: 'r' }
    );

    const minHtmlBuf = minifyHtml.minify(
        srcHtml,
        {
            allow_noncompliant_unquoted_attribute_values: true,
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

    const minHtmlCode = minHtmlBuf.toString('utf-8');
    const mainJsCode = await fs.readFile(
        path.join(DIST_DIR, MAIN_JS),
        { encoding: 'utf-8' }
    );

    const minHtmlInjectedCode = minHtmlCode.replace(
        MAIN_SCRIPT_INJECT_TEMPLATE,
        // SAFETY: This code is immutable and does not depend on user input.
        // No XSS is possible unless code review goes awry. And even then,
        // this code runs on compile-time, not run-time.
        `<script>${mainJsCode}</script>`,
    );

    await fs.writeFile(
        path.join(DIST_DIR, INDEX_HTML),
        minHtmlInjectedCode
    );
}

await createHtml();