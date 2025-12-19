// service Worker file (w.js)
// @ts-check

/** @type {CacheStorage} */
var caches = globalThis.caches;

/**
 * @typedef {Object} ExtendableEvent
 * @property {function(Promise<any>): undefined} waitUntil
 */

/**
 * @typedef {Object} FetchEvent
 * @property {function(Promise<Response | undefined>): undefined} respondWith
 * @property {Request} request
 */

/** @const {string} */
const CACHE_NAME = "ℙ⇒1";

self.addEventListener(
    "install",
    event =>
    {
        let extEvent = /** @type {ExtendableEvent} */ /** @type {*} */ (event);
        extEvent.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(["./index.html", "./f.svg", "./d.png", "./l.png", "./w.js"])),
        )
    }
);

/**
 * @param {FetchEvent} event 
 * @returns {Promise<Response>}
 */
async function respondToRequest(event)
{
    const reqUrl = new URL(event.request.url);

    return (
        reqUrl.origin == self.location.origin &&
        await caches.match(event.request)
    ) || await fetch(event.request)
}

self.addEventListener(
    "fetch",
    event =>
    {
        const fetchEvent = /** @type {FetchEvent} */ /** @type {*} */ (event);
        fetchEvent.respondWith(respondToRequest(fetchEvent))
    }
);