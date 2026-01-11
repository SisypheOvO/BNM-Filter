import { Core } from "@/app"

function init() {
    const initCore = async () => {
        await Core.removeClosedRows();
        await Core.improveTablesDisplay();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCore);
    } else {
        initCore();
    }

    // listen 2 url changes (if BN Management uses SPA routing)
    if (window.MutationObserver) {
        let lastUrl = location.href
        new MutationObserver(() => {
            const url = location.href
            if (url !== lastUrl) {
                lastUrl = url
                setTimeout(() => {
                    initCore()
                }, 500)
            }
        }).observe(document, { subtree: true, childList: true })
    }
}

// GM_addStyle maybe

init()
