import { Core } from "@/app"

function init() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            Core.removeClosedRows()
        })
    } else {
        Core.removeClosedRows()
    }

    // listen 2 url changes (if BN Management uses SPA routing)
    if (window.MutationObserver) {
        let lastUrl = location.href
        new MutationObserver(() => {
            const url = location.href
            if (url !== lastUrl) {
                lastUrl = url
                setTimeout(() => Core.removeClosedRows(), 500)
            }
        }).observe(document, { subtree: true, childList: true })
    }
}

init()
