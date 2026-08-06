// ==UserScript==
// @name         Cloudfam Landing Redirector & Timer Bypasser
// @namespace    https://github.com/cerealicious/web-scripts
// @version      1.2.0
// @description  Automatically redirects landing.php to predownload.php and bypasses the 15-second timer on cloudfam.io to reveal the download link immediately.
// @author       cerealicious
// @homepageURL  https://github.com/cerealicious/web-scripts
// @supportURL   https://github.com/cerealicious/web-scripts/issues
// @updateURL    https://raw.githubusercontent.com/cerealicious/web-scripts/main/cloudfam-bypass.user.js
// @downloadURL  https://raw.githubusercontent.com/cerealicious/web-scripts/main/cloudfam-bypass.user.js
// @icon         https://cloudfam.io/uploads/Favicon.png
// @match        https://cloudfam.io/adflow/landing.php*
// @match        https://cloudfam.io/adflow/predownload.php*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Kill window.open popups created by ad scripts
    window.open = function() {
        console.log("Blocked ad popup attempt!");
        return null;
    };

    const currentUrl = window.location.href;

    // 2. Redirect landing.php -> predownload.php
    if (currentUrl.includes('/adflow/landing.php')) {
        const newUrl = currentUrl.replace('/adflow/landing.php', '/adflow/predownload.php');
        window.location.replace(newUrl);
        return;
    }

    // 3. Bypass timer on predownload.php
    if (currentUrl.includes('/adflow/predownload.php')) {
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            const token = urlParams.get('token');

            const btnEl = document.getElementById('download-continue-btn');
            const timerEl = document.getElementById('countdown-timer-text');
            const statusEl = document.getElementById('progress-status-label');
            const fillEl = document.getElementById('progress-fill');

            if (btnEl) {
                if (fillEl) fillEl.style.width = '100%';
                if (timerEl) timerEl.textContent = 'Ready!';
                if (statusEl) {
                    statusEl.className = 'flex items-center gap-1.5 text-emerald-600 font-bold';
                    statusEl.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i> Verification complete! Ready to download.';
                }

                btnEl.disabled = false;
                btnEl.className = 'w-full py-4 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer';
                btnEl.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> Get Download Link';

                if (window.lucide) {
                    window.lucide.createIcons();
                }

                btnEl.onclick = function(e) {
                    // Prevent any leftover onclick ad listeners from firing
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/download.php?slug=${encodeURIComponent(slug)}&step=2&token=${encodeURIComponent(token)}`;
                };
            }
        });
    }
})();
