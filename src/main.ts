import { Core } from "@/app"

declare const CONFIG: {
    removeClosedBN: boolean
    improveTableStyle: boolean
    removeFadeEffect: boolean
}

function init() {
    // perform patches as early as possible
    if (CONFIG.removeFadeEffect) {
        Core.patchFadeRemoval()
    }
    Core.patchModalClose()

    const initCore = async () => {
        if (CONFIG.removeClosedBN) {
            await Core.removeClosedRows()
        }
        if (CONFIG.improveTableStyle) {
            await Core.improveTablesDisplay()
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCore)
    } else {
        initCore()
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
