// ==UserScript==
// @name         SilkCourses Direct Auto Enroll
// @namespace    https://github.com/cerealicious/web-scripts
// @version      1.0
// @icon         https://silkcourses.com//wp-content//uploads//2023//02//Gradient-Name-Initials-Lines-Logo-3.png
// @description  Automatically redirects to the target Udemy course link on SilkCourses
// @author       cerealicious
// @homepageURL  https://github.com/cerealicious/web-scripts
// @supportURL   https://github.com/cerealicious/web-scripts/issues
// @updateURL    https://raw.githubusercontent.com/cerealicious/web-scripts/main/silkcourses.user.js
// @downloadURL  https://raw.githubusercontent.com/cerealicious/web-scripts/main/silkcourses.user.js
// @match        https://silkcourses.com/*
// @license      MIT
// @run-at       document-body
// @grant        none
// ==/UserScript==

let enrollOnce = false;

function autoEnroll() {
    const btn = document.querySelector('.enroll_btn');
    if (btn && !enrollOnce) {
        let targetUrl = btn.href;

        // If the site's script already modified the link to an internal redirect, parse out the real Udemy URL
        if (targetUrl.includes('SilkUrl=')) {
            const params = new URLSearchParams(window.location.search);
            const parsedUrl = new URL(targetUrl).searchParams.get('SilkUrl');
            if (parsedUrl) targetUrl = parsedUrl;
        }

        if (targetUrl && targetUrl !== '#' && !targetUrl.endsWith('/enroll1/')) {
            enrollOnce = true;
            location.assign(targetUrl);
        }
    }
}

setInterval(autoEnroll, 100);
