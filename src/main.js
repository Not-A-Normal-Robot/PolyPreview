// @ts-check

/**
 * @const
 * @private
 */
const MediaKind = {
    /** @const @constant @readonly @type {0} */ NONE: 0,
    /** @const @constant @readonly @type {1} */ VIDEO: 1,
    /** @const @constant @readonly @type {2} */ IMAGE: 2,
    /** @const @constant @readonly @type {3} */ AUDIO: 3,
}

/** @typedef {typeof MediaKind[keyof typeof MediaKind]} MediaKind */

/** @const @private */
const IDS = {
    MEDIA_URL_INPUT: "u",
    LOAD_BUTTON: "l",
    DOWNLOAD_BUTTON: "d",
    DOWNLOAD_DIALOG: "g",
    DOWNLOAD_DIALOG_DOMAIN: "c",
    DOWNLOAD_DIALOG_PROCEED_BUTTON: "p",
    DOWNLOAD_DIALOG_CANCEL: "e",
    VIDEO_PLAYER: "v",
    IMAGE_VIEWER: "i",
    AUDIO_PLAYER: "h",
    ERROR_MESSAGE: "z",
};

/** @const @private */
const RADIO_BUTTONS_SELECTOR = 'input[type="radio"][name="t"]';

/** 
 * @const 
 * @private 
 * @type {HTMLInputElement[]}
 */
const RADIO_BUTTONS = Array.from(document.querySelectorAll(RADIO_BUTTONS_SELECTOR));

// Object.values manually unrolled for maximum compactness
/**
 * @private
 * @const
 * @type {[
 * HTMLInputElement,
 * HTMLButtonElement,
 * HTMLButtonElement,
 * HTMLDialogElement,
 * HTMLElement,
 * HTMLButtonElement,
 * HTMLButtonElement,
 * HTMLVideoElement,
 * HTMLImageElement,
 * HTMLAudioElement,
 * HTMLDetailsElement
 * ]}
 */
const [
    MEDIA_URL_INPUT,
    LOAD_BUTTON,
    DOWNLOAD_BUTTON,
    DOWNLOAD_DIALOG,
    DOWNLOAD_DIALOG_DOMAIN,
    DOWNLOAD_DIALOG_PROCEED_BUTTON,
    DOWNLOAD_DIALOG_CANCEL,
    VIDEO_PLAYER,
    IMAGE_VIEWER,
    AUDIO_PLAYER,
    ERROR_MESSAGE,
] = /** @type {*} */ ([
    IDS.MEDIA_URL_INPUT,
    IDS.LOAD_BUTTON,
    IDS.DOWNLOAD_BUTTON,
    IDS.DOWNLOAD_DIALOG,
    IDS.DOWNLOAD_DIALOG_DOMAIN,
    IDS.DOWNLOAD_DIALOG_PROCEED_BUTTON,
    IDS.DOWNLOAD_DIALOG_CANCEL,
    IDS.VIDEO_PLAYER,
    IDS.IMAGE_VIEWER,
    IDS.AUDIO_PLAYER,
    IDS.ERROR_MESSAGE,
].map(id => document.getElementById(id)));

/** @private */
let mediaUrl = "";
/** @type {MediaKind} */
let mediaKind = MediaKind.NONE;

/** @private */
function updateMedia()
{
    const kind = inferMediaKind(mediaUrl);

    [VIDEO_PLAYER, IMAGE_VIEWER, AUDIO_PLAYER].forEach(element =>
        /** @type {HTMLElement} */(element).hidden = true
    );

    if (!mediaUrl) return;

    /** @type {HTMLVideoElement | HTMLAudioElement | HTMLImageElement} */
    let display;

    switch (kind)
    {
        case MediaKind.VIDEO:
            display = VIDEO_PLAYER;
            break;
        case MediaKind.AUDIO:
            display = AUDIO_PLAYER;
            break;
        case MediaKind.IMAGE:
            display = IMAGE_VIEWER;
            break;
        default:
            return;
    }

    display.hidden = false;
    display.src = mediaUrl;
}

/**
 * @nosideeffects
 * @private
 * @param {string} input 
 * @param {string[]} keywords 
 * @returns {boolean}
 */
function matchesKeyword(input, keywords)
{
    return keywords.some(input.includes, input)
}

/**
 * @private
 * @nosideeffects
 * @param {number} value 
 * @returns {value is MediaKind}
 */
function isMediaKind(value)
{
    return [MediaKind.NONE, MediaKind.VIDEO, MediaKind.IMAGE, MediaKind.AUDIO]
        .includes(/** @type {MediaKind} */ /** @type {*} */(value));
}

/**
 * @private
 * @returns {void}
 */
function updateRadioButtons()
{
    RADIO_BUTTONS.forEach(button =>
    {
        button.checked = inferMediaKind(mediaUrl) === parseInt(button.value);
    });
}

/**
 * @private
 * @nosideeffects
 * @param {string} mediaUrl
 * @returns {MediaKind}
 */
function inferMediaKind(mediaUrl)
{
    if (mediaKind !== MediaKind.NONE)
        return mediaKind;

    const VIDEO_KEYWORDS = [
        ".mp4", ".webm", ".mov", ".avi", ".wmv", ".mkv"
    ];

    if (matchesKeyword(mediaUrl, VIDEO_KEYWORDS))
    {
        return MediaKind.VIDEO;
    }

    const IMAGE_KEYWORDS = [
        "image", "img", ".png", ".jpg", ".jpeg", ".svg",
        ".gif", ".webp", ".avif", ".bmp", ".ogv", ".ogx"
    ];

    if (matchesKeyword(mediaUrl, IMAGE_KEYWORDS))
    {
        return MediaKind.IMAGE;
    }

    const AUDIO_KEYWORDS = [
        ".mp3", ".m4a", ".opus", ".webm", ".ogg", ".wav",
        ".flac", ".oga"
    ];

    if (matchesKeyword(mediaUrl, AUDIO_KEYWORDS))
    {
        return MediaKind.AUDIO;
    }

    const value = RADIO_BUTTONS
        .find(element => element.checked)
        ?.value ?? MediaKind.VIDEO.toString();

    const numValue = parseInt(value, 10);
    if (isMediaKind(numValue)) return numValue;

    return MediaKind.VIDEO;
}

/** @private */
function loadFromUrl()
{
    const url = new URL(location.href);

    const hashUrl = url.hash.slice(1);
    const kind = url.searchParams.get("type") || "";

    let changed = false;

    const numKind = parseInt(kind, 10);

    if (isMediaKind(numKind) && numKind !== mediaKind)
    {
        mediaKind = numKind;
        changed = true;
    }

    if (hashUrl && hashUrl !== mediaUrl)
    {
        mediaUrl = hashUrl;
        changed = true;
    }

    if (changed)
    {
        MEDIA_URL_INPUT.value = mediaUrl;
        updateRadioButtons();
        updateMedia();
    }
}

loadFromUrl();

/**
 * @privete
 * @returns {void}
 */
function loadFromInput()
{
    mediaUrl = MEDIA_URL_INPUT.value;
    pushUrl();
    updateMedia();
}

LOAD_BUTTON.onclick = loadFromInput;

/**
 * @private
 * @this {GlobalEventHandlers}
 * @nosideeffects
 * @returns {void}
 */
function onRadioButtonClick()
{
    const kind = parseInt(/** @type {HTMLInputElement} */(this).value);
    if (isMediaKind(kind))
    {
        mediaKind = kind;
    }
}

RADIO_BUTTONS.forEach(button => button.onclick = onRadioButtonClick);

/**
 * @private
 * @this {GlobalEventHandlers}
 * @nosideeffects
 * @returns {void}
 */
function onInputChange()
{
    mediaUrl = /** @type {HTMLInputElement} */ (this).value;
    updateRadioButtons();
}

/**
 * @private
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function onInputKeydown(event)
{
    debugger;
    if (event.key === "Enter")
        loadFromInput();
}

MEDIA_URL_INPUT.oninput = onInputChange;
MEDIA_URL_INPUT.onkeydown = onInputKeydown;

function pushUrl()
{
    const url = new URL(window.location.href);

    url.search = mediaKind === MediaKind.NONE ? "" :
        `?type=${mediaKind}`;

    url.hash = mediaUrl ? `#${mediaUrl}` : "";

    history.pushState(0, '', url.toString());
}

window.onhashchange = loadFromUrl;