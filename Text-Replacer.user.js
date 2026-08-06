// ==UserScript==
// @name         Text Replacer Script
// @namespace    https://github.com/cerealicious/web-scripts
// @version      1.0
// @description  Replaces specific strings in the webpage DOM dynamically
// @author       cerealicious
// @homepageURL  https://github.com/cerealicious/web-scripts
// @supportURL   https://github.com/cerealicious/web-scripts/issues
// @updateURL    https://raw.githubusercontent.com/cerealicious/web-scripts/main/Text-Replacer.user.js
// @downloadURL  https://raw.githubusercontent.com/cerealicious/web-scripts/main/Text-Replacer.user.js
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Map of text to find and their replacements
    const replacements = {
        'Search1': 'replaced_text1',
        'Search2': 'replaced_text2',
        'Search3': 'replaced_text3',
        'Search4': 'replaced_text4'
    };

    // Helper function to escape regex characters
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a combined regular expression for efficiency
    const regexParts = Object.keys(replacements).map(escapeRegExp);
    const searchRegex = new RegExp(regexParts.join('|'), 'g');

    // Function to handle the actual text replacement inside a node
    function replaceTextInNode(node) {
        // Only target text nodes (nodeType 3)
        if (node.nodeType === 3) {
            const oldText = node.nodeValue;
            const newText = oldText.replace(searchRegex, (matched) => replacements[matched]);
            if (oldText !== newText) {
                node.nodeValue = newText;
            }
        } else {
            // Ignore script, style, and input/textarea tags so we don't break page logic or user typing
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                return;
            }
            // Recurse into child nodes
            for (let child of node.childNodes) {
                replaceTextInNode(child);
            }
        }
    }

    // Set up a MutationObserver to watch for new content injected into the page
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                replaceTextInNode(addedNode);
            }
        }
    });

    // Start running as soon as the DOM begins loading
    window.addEventListener('DOMContentLoaded', () => {
        replaceTextInNode(document.body);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();
