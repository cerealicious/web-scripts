// ==UserScript==
// @name         ZincDrive Background Auto-Timer & Hands-Free Clicker
// @namespace    https://github.com/cerealicious/web-scripts
// @version      5.2.0
// @description  Runs ZincDrive timers in the background without pausing and automatically clicks every step through to the final download.
// @author       cerealicious
// @homepageURL  https://github.com/cerealicious/web-scripts
// @supportURL   https://github.com/cerealicious/web-scripts/issues
// @updateURL    https://raw.githubusercontent.com/cerealicious/web-scripts/main/zincdrive-bypass.user.js
// @downloadURL  https://raw.githubusercontent.com/cerealicious/web-scripts/main/zincdrive-bypass.user.js
// @icon         https://zdrive.to/favicon.ico
// @match        https://zdrive.to/*
// @run-at       document-start
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Force Document Visibility state to always report "visible" and "focused"
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'hasFocus', { value: () => true, configurable: true });

    // 2. Block native blur/visibility/focusout events from firing
    const blockEvents = ['visibilitychange', 'webkitvisibilitychange', 'blur', 'mouseleave', 'pagehide', 'focusout'];

    window.addEventListener = new Proxy(window.addEventListener, {
        apply(target, thisArg, args) {
            if (blockEvents.includes(args[0])) {
                console.log(`[Userscript] Blocked window listener: ${args[0]}`);
                return;
            }
            return Reflect.apply(target, thisArg, args);
        }
    });

    document.addEventListener = new Proxy(document.addEventListener, {
        apply(target, thisArg, args) {
            if (blockEvents.includes(args[0])) {
                console.log(`[Userscript] Blocked document listener: ${args[0]}`);
                return;
            }
            return Reflect.apply(target, thisArg, args);
        }
    });

    // 3. Intercept jQuery when app.obf.js loads and strip jQuery blur/visibility handlers
    let jqInstance = null;
    Object.defineProperty(window, 'jQuery', {
        get() { return jqInstance; },
        set(newJq) {
            jqInstance = newJq;
            if (jqInstance && jqInstance.fn && jqInstance.fn.on) {
                const origOn = jqInstance.fn.on;
                jqInstance.fn.on = function(types, ...rest) {
                    if (typeof types === 'string') {
                        const filteredTypes = types.split(' ')
                            .filter(t => !blockEvents.includes(t.split('.')[0]))
                            .join(' ');
                        if (!filteredTypes) return this;
                        return origOn.call(this, filteredTypes, ...rest);
                    }
                    return origOn.call(this, types, ...rest);
                };
            }
        },
        configurable: true
    });
    window.$ = window.jQuery;

    // 4. Kill popunder/popup ad windows
    window.open = () => null;

    // 5. Disable back-button hijacking
    window.addEventListener('popstate', (e) => e.stopImmediatePropagation(), true);

    // 6. Automation Engine: Auto-clicks Stage 1, Stage 2, and the Final Link as soon as timers reach 0
    let isProcessing = false;

    function processDownloadStep() {
        if (isProcessing) return;

        // Stage 1 Form ("Start Download Process")
        const form1 = document.querySelector('#down_1Form');
        if (form1) {
            const btn1 = form1.querySelector('button');
            const timer1 = form1.querySelector('.download-file-timer span');
            const seconds1 = timer1 ? parseInt(timer1.textContent) : 0;

            if (seconds1 === 0 && btn1 && !btn1.disabled && btn1.style.display !== 'none') {
                console.log('[Userscript] Stage 1 Timer reached 0. Clicking...');
                isProcessing = true;
                btn1.click();
                setTimeout(() => { isProcessing = false; }, 1500);
                return;
            }
        }

        // Stage 2 Form ("Generate Download Link")
        const form2 = document.querySelector('#down_2Form');
        if (form2) {
            const btn2 = form2.querySelector('button');
            const timer2 = form2.querySelector('.download-file-timer span');
            const seconds2 = timer2 ? parseInt(timer2.textContent) : 0;

            if (seconds2 === 0 && btn2 && !btn2.disabled && btn2.style.display !== 'none') {
                console.log('[Userscript] Stage 2 Timer reached 0. Clicking...');
                isProcessing = true;
                btn2.click();
                setTimeout(() => { isProcessing = false; }, 1500);
                return;
            }
        }

        // Final Step: "Click Here to Download" link or container
        const finalBtn = document.querySelector('a[data-url], .download-section-box a[href*="cdn"], a.btn-download');
        if (finalBtn && finalBtn.href && !finalBtn.dataset.clicked) {
            console.log('[Userscript] Final download link ready! Triggering download...');
            finalBtn.dataset.clicked = "true";
            window.location.href = finalBtn.href;
        }
    }

    // Continuously monitor the DOM for timer updates and form swaps
    const observer = new MutationObserver(() => processDownloadStep());

    document.addEventListener('DOMContentLoaded', () => {
        processDownloadStep();
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
})();
