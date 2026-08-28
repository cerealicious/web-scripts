// ==UserScript==
// @name         Cloudfam Landing Redirector & Timer Bypasser
// @namespace    https://github.com/cerealicious/web-scripts
// @version      1.4.0
// @description  Instantly skips all Cloudfam onboarding, predownload, and download timers directly to the file download.
// @author       cerealicious
// @homepageURL  https://github.com/cerealicious/web-scripts
// @supportURL   https://github.com/cerealicious/web-scripts/issues
// @updateURL    https://raw.githubusercontent.com/cerealicious/web-scripts/main/cloudfam-bypass.user.js
// @downloadURL  https://raw.githubusercontent.com/cerealicious/web-scripts/main/cloudfam-bypass.user.js
// @icon         https://cloudfam.io/uploads/Favicon.png
// @match        https://cloudfam.io/*
// @license      MIT
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Block ad popup/popunder windows
    window.open = function() {
        console.log('[Userscript] Blocked popunder window!');
        return null;
    };

    // 2. Fast-forward setInterval timers on download pages (1000ms -> 10ms)
    const origSetInterval = window.setInterval;
    window.setInterval = function(callback, delay, ...args) {
        if (delay === 1000 || delay === '1000' || delay === 1000 / 1) {
            delay = 10; // 100x faster countdown without breaking page script execution
        }
        return origSetInterval.call(this, callback, delay, ...args);
    };

    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const token = urlParams.get('token');

    // 3. Skip premiumonboard, landing, and redirection directly to Step 2
    if (currentUrl.includes('/adflow/premiumonboard.php') || 
        currentUrl.includes('/adflow/landing.php') || 
        currentUrl.includes('/adflow/predownload.php') || 
        currentUrl.includes('/redirection')) {
        
        // Neutralize anti-adblock detection hooks
        window.onAabcScriptError = () => {};
        window.AABC_ON_DETECT = () => {};

        if (slug && token) {
            const step2Url = `https://cloudfam.io/download.php?slug=${encodeURIComponent(slug)}&step=2&token=${encodeURIComponent(token)}`;
            window.location.replace(step2Url);
            return;
        }
    }

    // 4. Handle final download.php: Fast-forward timer and auto-click download button
    if (currentUrl.includes('/download.php')) {
        function autoTriggerDownload() {
            // Find any download buttons or download_handler links
            const downloadBtn = document.querySelector('a[href*="download_handler.php"], button#download-btn, button[id*="download"], a.btn-download, button:not([disabled])');
            
            // If the button is present and not locked/disabled, click it
            if (downloadBtn && !downloadBtn.disabled && !downloadBtn.dataset.clicked) {
                const href = downloadBtn.getAttribute('href');
                if (href && href.includes('download_handler.php')) {
                    downloadBtn.dataset.clicked = "true";
                    console.log('[Userscript] Download link ready! Triggering download...');
                    window.location.href = href;
                } else if (downloadBtn.tagName === 'BUTTON' && !downloadBtn.classList.contains('cursor-not-allowed')) {
                    downloadBtn.dataset.clicked = "true";
                    downloadBtn.click();
                }
            }
        }

        const observer = new MutationObserver(() => autoTriggerDownload());

        document.addEventListener('DOMContentLoaded', () => {
            autoTriggerDownload();
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        });
    }
})();
