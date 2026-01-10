export class DomWaiter {
    static waitForElement(selector: string, timeout: number = 5000): Promise<NodeListOf<Element> | null> {
        return new Promise((resolve) => {
            const elements = document.querySelectorAll(selector)
            if (elements.length > 0) {
                resolve(elements)
                return
            }

            let timer: number | null = null

            const observer = new MutationObserver(() => {
                const elements = document.querySelectorAll(selector)
                if (elements.length > 0) {
                    observer.disconnect()
                    if (timer !== null) clearTimeout(timer)
                    resolve(elements)
                }
            })

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            })

            timer = window.setTimeout(() => {
                observer.disconnect()
                console.warn(`[DomWaiter] Timeout waiting for: ${selector}`)
                resolve(null)
            }, timeout)
        })
    }

    static waitForBNTables(timeout: number = 5000): Promise<NodeListOf<Element> | null> {
        const selector = `table.table-dark tbody tr`
        return this.waitForElement(selector, timeout)
    }
}

export class DomUtils {}
