// service Worker file (w.js)
// @ts-check

/**
 * @typedef {Object} ExtendableEvent
 * @property {function(Promise<any>): undefined} waitUntil
 */

/**
 * @typedef {Object} FetchEvent
 * @property {function(Promise<Response | undefined>): undefined} respondWith
 * @property {Request} request
 */

/** @constant {string} */
const CACHE_NAME = "ℙ⇒1";

self.addEventListener(
    "install",
    /** @param {unknown} event */
    (event) =>
    {
        /** @type {ExtendableEvent} */ (event).waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.add("./index.html")),
    )
    }
);

self.addEventListener(
    "fetch",
    /** @param {unknown} event */
    (event) =>
    {
        /** @type {FetchEvent} */ (event)
            .respondWith(
                caches.match(
                    /** @type {FetchEvent} */(event).request
                )
            );
    }
);