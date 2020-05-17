const handyKeyMap: {
    [idx: string]: string
} = {
    'alt': 'Alt',
    'option': 'Alt',
    'control': 'Control',
    'ctrl': 'Control',
    'meta': 'Meta',
    'command': 'Meta',
    'cmd': 'Meta',
    'windows': 'Meta',
    'shift': 'Shift',
    'enter': 'Enter',
    'tab': 'Tab',
    'space': ' ',
    'up': 'ArrowUp',
    'down': 'ArrowDown',
    'left': 'ArrowLeft',
    'right': 'ArrowRight',
    'backspace': 'Backspace',
    'esc': 'Escape'
};

const shiftedKeys: {
    [idx: string]: string
} = {
    '|': '\\',
    '}': ']',
    '{': '[',
    '"': "'",
    ':': ';',
    '<': ',',
    '>': '.',
    '?': '/',
    '~': '.',
    '!': '1',
    '@': '2',
    '#': '3',
    '$': '4',
    '%': '5',
    '^': '6',
    '&': '7',
    '*': '8',
    '(': '9',
    ')': '0',
    '_': '-',
    '+': '='
};

const functionKeys = '1,2,3,4,5,6,7,8,9,10,11,12'.split(',').reduce((pre, cur) => {
    pre[`f${cur}`] = `F${cur}`;
    return pre;
}, {} as { [idx: string]: string });

const modifierKeys: {
    [idx: string]: keyof KeyboardEvent
} = {
    Control: 'ctrlKey',
    Meta: 'metaKey',
    Shift: 'shiftKey',
    Alt: 'altKey'
};

const alphabet: string = 'abcdefghijklmnopqrstuvwxyz';
const supportedKey = [
    ...Object.values(handyKeyMap),
    ...Object.values(functionKeys),
    ...Object.values(shiftedKeys),
    ...Object.keys(shiftedKeys),
    ...alphabet,
    ...(alphabet.toUpperCase())
].reduce((pre, key) => {
    pre[key] = key;

    return pre;
}, {} as { [idx: string]: string });

/**
 * Map handy key to supported standard key.
 * @param handyKey key to map
 */
export function mapToStandardKey(handyKey: string) {
    return handyKeyMap[handyKey] || shiftedKeys[handyKey] || functionKeys[handyKey] || handyKey.toLowerCase();
}

/**
 * Check if the key is one of the following modifier keys:
 * Control, Alt, Shift, Meta
 * @param key key to test. Normally this parameter should come from `KeyboardEvent.key`
 */
export function isModifier(key: string) {
    return !!modifierKeys[key];
}

/**
 * Check if given modifier key is pressed
 */
export function isModifierPressed(key: string, e: KeyboardEvent) {
    return !!e[modifierKeys[key]];
}

/**
 * Restore shifted key to non shifted. Convert key to lower-case if it is a single character.
 * @param key key to normalize. Normally this parameter should come from `KeyboardEvent.key`
 */
export function normalize(key: string) {
    return shiftedKeys[key] || (key.length === 1 ? key.toLocaleLowerCase() : key);
}

/**
 * Check if the key is supported by this library
 * @param key key to test. Normally this parameter should come from `KeyboardEvent.key`
 */
export function isSupportedKey(key: string) {
    return !!supportedKey[key] || key.length === 1;
}
