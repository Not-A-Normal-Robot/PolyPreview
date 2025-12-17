// service workes Setup (s.js)
// @ts-check

const SW_PATH = "w.js";
const SW_KEYWORD = "serviceWorker";

/**
 * @typedef {Object} ServiceWorkerContainer
 * @property {function(string): Promise<any>} register
 */

if (SW_KEYWORD in navigator)
{
    /** @type {ServiceWorkerContainer} */ (navigator[SW_KEYWORD])
        .register(SW_PATH).then(
            () => console.log("init"),
            (e) => console.error(e)
        );
}
