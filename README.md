# Keybinding
![npm](https://img.shields.io/npm/v/keybinding)
![npm](https://img.shields.io/badge/no-dependencies-green)
![npm](https://img.shields.io/badge/coverage-88%25-green)
![build-and-test](https://github.com/codertx/keybinding/workflows/build-and-test/badge.svg?branch=master&event=push)

A typescript library to handle hotkeys in browser.

## Usage

```bash
$ yarn add keybinding
```

```javascript
import Keybinding from 'keybinding';

const keybinding = new Keybinding();

keybinding.on('ctrl + a', () => {
    console.log('ctrl + a pressed!');
});
```

### Supported Keys

Keybinding support function keys, common modifier keys and some special keys. You can use their handy name to bind event.

- Function keys: `f1` - `f12`
- Shift: `shift`
- Meta: `meta`, `windows`, `command`, `cmd` 
- Control: `control`, `ctrl`
- Alt: `alt`, `option`
- Space: `space`
- Arrow keys: `up`, `down`, `left`, `right`
- Backspace: `backspace`, `back`
- Enter: `enter`
- Alphabet keys: `a` - `z` and `A` - `Z`
- Number keys: `0` - `9`
- Punctuation keys: `` ` ``,`-`, `+`, `[`, `]`, `\`, `;`, `'`, `,`, `.`, `/` 

### API

**construct options**
```typescript
interface IKeybindingOptions {
    /**
     * Do not call handler when focus on editable element.
     * Default to true.
     */
    filterEditable: boolean;
}

new Keybinding(options?: IKeybindingOptions);
```

**on**

Add a hotkey handler.

```typescript
/**
 * @param key hotkey string
 * @param handler callback function when the hotkey pressed
 * @param scope the scope which bind at, use 'default' by default
 */
keybinding.on(key: string, handler: (keybind: Keybinding) => any, scope?: string): void

keybind.on('ctrl + a', () => {
    console.log('ctrl + a pressed')!
});

// Key is case-insensitive and space-trimming. Thus, the following two calls are equal.
keybind.on('cTRl    +       A', console.log);
keybind.on('ctrl+a', console.log);
```

**off**

Remove a hotkey handler.

```typescript
/**
 * @param key hotkey string
 * @param handler callback function to remove
 * @param scope the scope which bind at, use 'default' by default
 */
keybinding.off(key: string, handler: (keybind: Keybinding) => any, scope?: string): void

keybind.off('ctrl + a', aBoundHandler);
```

> Scopes are used to control whether handler should be called when the bound hotkey was pressed. See more detail in `disable`/`enable` method.

**disable/enable**

`disable` method will disable the given scope's handlers. All handlers under the given scope will not be called even if the hotkeys they bound was pressed until the `enable` method called. 

```typescript
/**
 * Disable given scope's hotkeys.
 * @param scope scope to disable, use 'all' by default
 */
keybinding.disable(scope?: string);
/**
 * Enable given scope's hotkeys
 * @param scope Scope to enable, use 'all' by default
 */
keybinding.enable(scope?: string);

// After pressing Control + A, handlerA won't be called but handlerB will still be called.
keybind.on('ctrl + a', handlerA);
keybind.on('ctrl + a', handlerB, 'scope2');
keybind.disable('default');

// You can choose to pass no parameter to disable all handler.
// In the following example, both handlerC and handlerD won't be called.
keybind.on('ctrl + a', handlerC, 'scope');
keybind.on('ctrl + a', handlerD, 'scope2');
keybind.disable();   // equal to keybind.disable('all')

// use enable to restore given  disabled scope
keybind.enable('scope1')    // enable 'scope1'
keybind.enable()            // enable all scope, equal to keybind.disable('all')
```

**destroy**

Destroy instance.

```typescript
keybind.destroy();
```
