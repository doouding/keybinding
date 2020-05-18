const puppeteer = require('puppeteer');
const path = require('path');
const testPage = path.resolve(__dirname, './test.html');

/** @type { import('puppeteer').Page } */
let page
let browser
let getStatus;

beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.goto(`file://${testPage}`);
    await page.evaluate(() => {
        window.handlerHelper = (handlerSymbol) => {
            const status = handlerSymbol + 'Status';

            window[handlerSymbol] = () => {
                window[status] = window[status] ? (window[status] + 1) : 1;
            };
            return window[handlerSymbol];
        }
        window.getHandler = (handlerSymbol) => {
            return window[handlerSymbol];
        }
        window.clearHelper = (handlerSymbol) => {
            delete window[handlerSymbol];
            delete window[handlerSymbol + 'Status'];
        }
    });

    getStatus = (handlerSymbol) => {
        return window[handlerSymbol + 'Status']
    }
});

afterAll(async () => {
    await browser.close();
});

describe('keybinding basic functionality', () => {
    beforeAll(async () => {
        await page.evaluate(() => {
            window.keybind = new Keybinding();
        });
    });

    afterAll(async () => {
        await page.evaluate(() => {
            window.keybind.destroy();
            delete window.keybind;
        });
    });

    test('keybinding on/off method should work as expect', async () => {
        await page.evaluate(() => {
            keybind.on('ctrl + a', handlerHelper('case1'));
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);

        await page.evaluate(() => {
            keybind.off('ctrl + a', getHandler('case1'));
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);

        await page.evaluate(() => {
            clearHelper('case1');
        });
    })

    test('on/off method should be case-insensitive and space-trimming', async () => {
        await page.evaluate(() => {
            keybind.on('ShiFt     +    A', handlerHelper('case1'));
        });
        await page.keyboard.down('ShiftLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ShiftLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.evaluate(() => {
            keybind.off('shIFt  +  a', getHandler('case1'));
        });
        await page.keyboard.down('ShiftLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ShiftLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.evaluate(() => {
            clearHelper('case1');
        });
    });

    test('shift modifier', async () => {
        await page.evaluate(() => {
            keybind.on('shift + a', handlerHelper('case1'));
        });
        await page.keyboard.down('ShiftLeft');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('a');
        await page.keyboard.down('a');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.down('ShiftRight');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.up('a');
        await page.keyboard.up('ShiftLeft');
        await page.keyboard.up('ShiftRight');
        await page.evaluate(() => {
            keybind.off('shift + a', getHandler('case1'));
            clearHelper('case1');
        });
    });

    test.each(
        ['control', 'ctrl']
    )('control modifier: %s', async (key) => {
        const bindKey = `${key} + a`;

        await page.evaluate((bindKey) => {
            keybind.on(bindKey, handlerHelper('case1'));
        }, bindKey);
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('a');
        await page.keyboard.down('a');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.down('ControlRight');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.up('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('ControlRight');
        await page.evaluate((bindKey) => {
            keybind.off(bindKey, getHandler('case1'));
            clearHelper('case1');
        }, bindKey);
    });

    test.each(
        ['meta', 'command', 'windows', 'cmd']
    )('meta modifier: %s', async (key) => {
        const bindKey = `${key} + a`;

        await page.evaluate((bindKey) => {
            keybind.on(bindKey, handlerHelper('case1'));
        }, bindKey);
        await page.keyboard.down('MetaLeft');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('a');
        await page.keyboard.down('a');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.down('MetaRight');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.up('a');
        await page.keyboard.up('MetaLeft');
        await page.keyboard.up('MetaRight');
        await page.evaluate((bindKey) => {
            keybind.off(bindKey, getHandler('case1'));
            clearHelper('case1');
        }, bindKey);
    });

    test.each(
        ['alt', 'option']
    )('alt modifier: %s', async (key) => {
        const bindKey = `${key} + a`;

        await page.evaluate((bindKey) => {
            keybind.on(bindKey, handlerHelper('case1'));
        }, bindKey);
        await page.keyboard.down('AltLeft');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('a');
        await page.keyboard.down('a');
        await page.keyboard.down('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.down('AltLeft');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.keyboard.up('a');
        await page.keyboard.up('AltLeft');
        await page.keyboard.up('AltRight');
        await page.evaluate((bindKey) => {
            keybind.off(bindKey, getHandler('case1'));
            clearHelper('case1');
        }, bindKey);
    });

    test.each([
        ['left', 'ArrowLeft'],
        ['up', 'ArrowUp'],
        ['right', 'ArrowRight'],
        ['down', 'ArrowDown'],
        ['space', ' '],
        ['esc', 'Escape'],
        ['enter', 'Enter'],
        ['tab', 'Tab'],
        ...('1,2,3,4,5,6,7,8,9,10,11,12'.split(',').map(val => [`f${val}`, `F${val}`]))
    ])('special key: %s', async (bindKey, simulateKey) => {
        await page.evaluate((bindKey) => {
            keybind.on(bindKey, handlerHelper('case1'));
        }, bindKey);

        await page.keyboard.down(simulateKey);
        await page.keyboard.up(simulateKey);
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down(simulateKey);
        await page.keyboard.up(simulateKey);
        await page.keyboard.down(simulateKey);
        await page.keyboard.up(simulateKey);
        await page.keyboard.down(simulateKey);
        await page.keyboard.up(simulateKey);
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.evaluate((bindKey) => {
            keybind.off(bindKey, getHandler('case1'));
        }, bindKey);

        await page.keyboard.down(simulateKey);
        await page.keyboard.up(simulateKey);
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);

        await page.evaluate(() => {
            clearHelper('case1');
        });
    });

    test('should not call handler after destroy', async() => {
        await page.evaluate(() => {
            window.keybind2 = new Keybinding();
            keybind2.on('ctrl + a', handlerHelper('case1'));
        })

        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);

        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);

        await page.evaluate(() => {
            window.keybind2.destroy();
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);

        await page.evaluate(() => {
            clearHelper('case1');
            delete window.keybind2;
        })
    });
});

describe('keybinding scope functionality', () => {
    beforeAll(async () => {
        await page.evaluate(() => {
            window.keybind = new Keybinding();
        });
    });

    afterAll(async () => {
        await page.evaluate(() => {
            window.keybind.destroy();
            delete window.keybind;
        });
    });

    beforeEach(async () => {
        await page.evaluate(() => {
            keybind.on('ctrl + a', handlerHelper('case1'));
            keybind.on('ctrl + a', handlerHelper('case2'), 'scope2');
            keybind.on('ctrl + a', handlerHelper('case3'), 'scope3');
        });
    });

    afterEach(async () => {
        await page.evaluate(() => {
            keybind.off('ctrl + a', getHandler('case1'));
            keybind.off('ctrl + a', getHandler('case2'), 'scope2');
            keybind.off('ctrl + a', getHandler('case3'), 'scope3');

            clearHelper('case1');
            clearHelper('case2');
            clearHelper('case3');
        });
    });

    test('default enable/disable should work as expected', async () => {
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);
        expect(await page.evaluate(getStatus, 'case2')).toBe(1);
        expect(await page.evaluate(getStatus, 'case3')).toBe(1);

        await page.evaluate(() => {
            window.keybind.disable();
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);
        expect(await page.evaluate(getStatus, 'case2')).toBe(1);
        expect(await page.evaluate(getStatus, 'case3')).toBe(1);

        await page.evaluate(() => {
            window.keybind.enable();
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);
        expect(await page.evaluate(getStatus, 'case2')).toBe(2);
        expect(await page.evaluate(getStatus, 'case3')).toBe(2);
    });

    test('enable/disable should work with parameter', async () => {
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(1);
        expect(await page.evaluate(getStatus, 'case2')).toBe(1);
        expect(await page.evaluate(getStatus, 'case3')).toBe(1);

        await page.evaluate(() => {
            keybind.disable('scope2');
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(2);
        expect(await page.evaluate(getStatus, 'case2')).toBe(1);
        expect(await page.evaluate(getStatus, 'case3')).toBe(2);

        await page.evaluate(() => {
            keybind.disable('scope3');
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(3);
        expect(await page.evaluate(getStatus, 'case2')).toBe(1);
        expect(await page.evaluate(getStatus, 'case3')).toBe(2);

        await page.evaluate(() => {
            keybind.enable();
        });
        await page.keyboard.down('ControlLeft');
        await page.keyboard.down('a');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.up('a');
        expect(await page.evaluate(getStatus, 'case1')).toBe(4);
        expect(await page.evaluate(getStatus, 'case2')).toBe(2);
        expect(await page.evaluate(getStatus, 'case3')).toBe(3);
    });
});
