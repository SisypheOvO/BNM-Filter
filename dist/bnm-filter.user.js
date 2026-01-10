// ==UserScript==
// @name         BNM-Filter
// @namespace    URL
// @version      0.1.0
// @description  filter opened BNs in BN Management list
// @author       Sisyphus
// @license      MIT
// @homepage     https://github.com/SisypheOvO
// @match        https://bn.mappersguild.com/*
// @run-at       document-end
// @grant        none
// @downloadURL https://raw.githubusercontent.com/SisypheOvO/BNM-Filter/main/dist/bnm-filter.user.js
// @updateURL https://raw.githubusercontent.com/SisypheOvO/BNM-Filter/main/dist/bnm-filter.user.js
// ==/UserScript==


(function () {
    'use strict';

    class DomWaiter {
        static waitForElement(selector, timeout = 5000) {
            return new Promise((resolve) => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    resolve(elements);
                    return;
                }
                let timer = null;
                const observer = new MutationObserver(() => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        observer.disconnect();
                        if (timer !== null)
                            clearTimeout(timer);
                        resolve(elements);
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
                timer = window.setTimeout(() => {
                    observer.disconnect();
                    console.warn(`[DomWaiter] Timeout waiting for: ${selector}`);
                    resolve(null);
                }, timeout);
            });
        }
        static waitForBNTables(timeout = 5000) {
            const selector = `table.table-dark tbody tr`;
            return this.waitForElement(selector, timeout);
        }
    }

    class Core {
        static async removeClosedRows() {
            const rows = await DomWaiter.waitForBNTables();
            if (!rows) {
                console.warn("[BNM-Filter] No BNs rows found");
                return;
            }
            console.log(`[BNM-Filter] Found ${rows.length} BNs rows`);
            const tables = document.querySelectorAll("table.table-dark");
            tables.forEach((table, tableIndex) => {
                const tbody = table.querySelector("tbody");
                if (!tbody)
                    return;
                const rowsToRemove = tbody.querySelectorAll('tr:has(span.badge-danger[data-toggle="tooltip"][title="closed"])');
                console.log(`[BNM-Filter] Table ${tableIndex + 1}: Removing ${rowsToRemove.length} closed rows`);
                // do remove
                rowsToRemove.forEach((tr) => {
                    try {
                        tr.remove();
                    }
                    catch (e) {
                        console.error("[BNM-Filter] Error removing row:", e);
                    }
                });
                // add message if no open BNs
                setTimeout(() => {
                    if (tbody && tbody.children.length === 0) {
                        // check if message already exists
                        const existingMsg = tbody.querySelector("tr td.text-muted");
                        if (!existingMsg) {
                            const message = document.createElement("tr");
                            message.innerHTML = `<td colspan="1" class="text-center text-muted">No open BNs in this mode</td>`;
                            tbody.appendChild(message);
                        }
                    }
                    else if (tbody && tbody.children.length > 0) {
                        // remove message if exists
                        const existingMsg = tbody.querySelector("tr td.text-muted");
                        if (existingMsg && existingMsg.textContent.includes("No open BNs")) {
                            existingMsg.closest("tr")?.remove();
                        }
                    }
                }, 100);
            });
        }
    }

    function init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                Core.removeClosedRows();
            });
        }
        else {
            Core.removeClosedRows();
        }
        // listen 2 url changes (if BN Management uses SPA routing)
        if (window.MutationObserver) {
            let lastUrl = location.href;
            new MutationObserver(() => {
                const url = location.href;
                if (url !== lastUrl) {
                    lastUrl = url;
                    setTimeout(() => Core.removeClosedRows(), 500);
                }
            }).observe(document, { subtree: true, childList: true });
        }
    }
    init();

})();
