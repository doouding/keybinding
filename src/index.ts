import { mapToStandardKey, normalize, isSupportedKey, isModifierPressed, isModifier } from './keymap';

let pressedKeyStr = '';
const pressedKeyList: string[] = [];
const dispatches: ((e: KeyboardEvent) => any)[] = [];

const keyDownDispatcher = (e: KeyboardEvent) => {
    const key = normalize(e.key);

    if(!isSupportedKey(key)) {
        return;
    }

    const notPressed = pressedKeyList.indexOf(key) === -1;

    if(notPressed) {
        pressedKeyList.push(key);
        pressedKeyList.sort();
        updatePressedKeyStr();
    }

    if(notPressed || !isModifier(key)) {
        dispatch(e);
    }
}

const keyUpDispatcher = (e: KeyboardEvent) => {
    const key = normalize(e.key);

    if(
        !isSupportedKey(key) ||
        (isModifier(key) && isModifierPressed(key, e))
    ) {
        return;
    }

    pressedKeyList.splice(pressedKeyList.indexOf(key), 1);
    pressedKeyList.sort();

    updatePressedKeyStr();
}

const updatePressedKeyStr = () => {
    pressedKeyStr = pressedKeyList.join('');
}

const initDomEvent = () => {
    document.addEventListener('keydown', keyDownDispatcher, false);
    document.addEventListener('keyup', keyUpDispatcher, false);
}

const dispatch = (e: KeyboardEvent) => {
    dispatches.forEach((dispatch) => {
        try {
            dispatch(e);
        } catch(e) {
            console.error(e);
        }
    });
}

const isFocusEditableElement = () => {
    const activeEl = document.activeElement;

    return activeEl
        && !(activeEl as HTMLInputElement).readOnly
        && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)
}

initDomEvent();

interface IHotkeyHandler {
    (hotkeys: Keybinding): any
}

interface IScopeHandler {
    handler: IHotkeyHandler,
    scope: string;
}

interface IKeybindingOptions {
    /**
     * Do not trigger handler when focus on editable element.
     * Default to true.
     */
    filterEditable: boolean;
}

export default class Keybinding {
    get pressedKey(): string {
        return pressedKeyStr;
    }

    private disabledScope: {
        [scope: string]: boolean
    } = {};

    private handlers: {
        [hotkey: string] : IScopeHandler[]
    } = {};

    private options: IKeybindingOptions;

    constructor(options: IKeybindingOptions = { filterEditable: true }) {
        this.options = options;

        dispatches.push(this.dispatch);
    }

    private enableAllScope() {
        Object.keys(this.disabledScope).forEach((key) => {
            delete this.disabledScope[key];
        });
    }

    private dispatch = (e: KeyboardEvent) => {
        const handlers = this.handlers[pressedKeyStr];
        const disabledScope = this.disabledScope;

        if(!handlers || handlers.length === 0 || disabledScope['all'] || (this.options.filterEditable && isFocusEditableElement())) {
            return;
        }

        handlers.forEach((handler) => {
            if(disabledScope[handler.scope]) {
                return;
            }

            handler.handler(this);
        });
    }

    private findCallback(handlers: IScopeHandler[], handler: IHotkeyHandler, scope: string): number {
        return handlers.findIndex((scopeHandler: IScopeHandler) => {
            return scopeHandler.handler === handler && scopeHandler.scope === scope;
        })
    }

    private offHotKey(targetHotkeys: string, handler: IHotkeyHandler, scope: string) {
        const handlers = this.handlers[targetHotkeys];

        if(!handlers) {
            return;
        }

        const idx = this.findCallback(handlers, handler, scope);

        if(idx !== -1) {
            handlers.splice(idx, 1);
        }
    }

    private onHotKey(targetHotkeys: string, handler: IHotkeyHandler, scope: string) {
        const handlers = this.handlers[targetHotkeys] = this.handlers[targetHotkeys] || [];

        if(this.findCallback(handlers, handler, scope) === -1) {
            handlers.push({
                handler,
                scope
            });
        }
    }

    /**
     * Parse bind key
     * @param key 
     */
    private parseBindkey(key: string) {
        return key
            .toLocaleLowerCase()
            .replace(/\s/g, '')
            .split(',')
            .map((hotkey: string) => {
                return hotkey.split('+').map((seperatedKey: string) => mapToStandardKey(seperatedKey)).sort().join('')
            });
    }

    /**
     * Destroy
     */
    destroy() {
        dispatches.splice(dispatches.indexOf(this.dispatch), 1);

        delete this.handlers;
        delete this.disabledScope;
    }

    /**
     * Bind hotkeys
     * @param key hotkey
     * @param handler callback function when hotkey pressed
     * @param scope the scope which bind at, use 'default' by default
     */
    on(key: string, handler: IHotkeyHandler, scope = 'default') {
        this.parseBindkey(key).forEach((key) => {
            this.onHotKey(key, handler, scope);
        });
    }

    /**
     * Unbind hotkeys
     * @param key hotkey
     * @param handler callback function to unbind
     * @param scope the scope which bind at, use 'default' by default
     */
    off(key: string, handler: IHotkeyHandler, scope = 'default') {
        this.parseBindkey(key).forEach((key) => {
            this.offHotKey(key, handler, scope);
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
