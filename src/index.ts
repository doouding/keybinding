import { mapToStandardKey, restoreShiftKey, isSupportedKey, isModifierPressed, isModifier } from './keymap';

const pressedKeyList: string[] = [];

export class Keybinding {
    private disabledScope: {
        [scope: string]: boolean
    } = {};

    private handlers: {
        [hotkey: string] : {
            scope: string,
            handler: (hotkeys: Keybinding) => any
        }[]
    } = {};

    constructor() {
        this.initDomEvent();
    }

    private enableAllScope() {
        Object.keys(this.disabledScope).forEach((key) => {
            delete this.disabledScope[key];
        });
    }

    private keyDownDispatcher = (e: KeyboardEvent) => {
        const key = restoreShiftKey(e.key);

        if(!isSupportedKey(key) || pressedKeyList.indexOf(key) !== -1) {
            return;
        }

        pressedKeyList.push(key);
        pressedKeyList.sort();

        this.dispatch();
    }

    private keyUpDispatcher = (e: KeyboardEvent) => {
        const key = restoreShiftKey(e.key);

        if(
            !isSupportedKey(key) ||
            (isModifier(key) && isModifierPressed(key, e))
        ) {
            return;
        }

        pressedKeyList.splice(pressedKeyList.indexOf(key), 1);
        pressedKeyList.sort();
    }

    private dispatch() {
        const currentHotkey = pressedKeyList.join('');
        const handlers = this.handlers[currentHotkey];
        const disabledScope = this.disabledScope;

        if(!handlers || handlers.length === 0 || disabledScope['all']) {
            return;
        }

        handlers.forEach((handler) => {
            if(disabledScope[handler.scope]) {
                return;
            }

            handler.handler(this);
        });
    }

    private onHotKey(targetHotkeys: string, handler: (hotkeys: Keybinding) => any, scope: string) {
        this.handlers[targetHotkeys] = this.handlers[targetHotkeys] || [];
        this.handlers[targetHotkeys].push({
            handler,
            scope
        });
    }

    private initDomEvent() {
        document.addEventListener('keydown', this.keyDownDispatcher, false);
        document.addEventListener('keyup', this.keyUpDispatcher, false);
    }

    /**
     * Destroy
     */
    destroy() {
        document.removeEventListener('keydown', this.keyDownDispatcher, false);
        document.removeEventListener('keyup', this.keyUpDispatcher, false);
    }

    /**
     * Register hotkeys
     * @param key hotkey combination
     * @param handler callback function when hotkey pressed
     * @param scope the scope which registered at, use 'default' by default
     */
    on(key: string, handler: (hotkey: Keybinding) => any, scope = 'default') {
        const keys = key.toLowerCase().replace(/\s/g, '').split(',');

        keys.forEach((hotkey: string) => {
            const hotKeyList = hotkey.split('+').map((seperatedKey: string) => mapToStandardKey(seperatedKey)).sort().join('');

            this.onHotKey(hotKeyList, handler, scope);
        });
    }

    /**
     * Disable given scope's registered hotkeys
     * @param scope scope to disable, use 'all' by default
     */
    disable(scopes: string | string[] = 'all') {
        if(Array.isArray(scopes)) {
            scopes.forEach((scope) => {
                this.disabledScope[scope] = true;
            });
        }
        else {
            this.disabledScope[scopes] = true;
        }
    }

    /**
     * Enable given scope's hotkeys
     * @param scopes Scope to enable, use 'all' by default
     */
    enable(scopes: string | string[] = 'all') {
        if(scopes === 'all') {
            this.enableAllScope();
        }
        else if(typeof scopes === 'string') {
            delete this.disabledScope[scopes];
        }
        else {
            for(let scope of scopes) {
                if(scope === 'all') {
                    this.enableAllScope();
                    return;
                }

                delete this.disabledScope[scope];
            }
        }
    }
}
