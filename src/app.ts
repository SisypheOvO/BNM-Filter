import { DomWaiter } from "./utils/dom"

export class Core {
    static async removeClosedRows() {
        const rows = await DomWaiter.waitForBNTables()
        if (!rows) {
            console.warn("[BNM-Filter] No BNs rows found")
            return
        }

        console.log(`[BNM-Filter] Found ${rows.length} BNs rows`)

        const tables = document.querySelectorAll("table.table-dark")
        tables.forEach((table, tableIndex) => {
            const tbody = table.querySelector("tbody")
            if (!tbody) return

            const rowsToRemove = tbody.querySelectorAll('tr:has(span.badge-danger[data-toggle="tooltip"][title="closed"])')

            console.log(`[BNM-Filter] Table ${tableIndex + 1}: Removing ${rowsToRemove.length} closed rows`)

            // do remove
            rowsToRemove.forEach((tr) => {
                try {
                    tr.remove()
                } catch (e) {
                    console.error("[BNM-Filter] Error removing row:", e)
                }
            })

            // add message if no open BNs
            setTimeout(() => {
                if (tbody && tbody.children.length === 0) {
                    // check if message already exists
                    const existingMsg = tbody.querySelector("tr td.text-muted")
                    if (!existingMsg) {
                        const message = document.createElement("tr")
                        message.innerHTML = `<td colspan="1" class="text-center text-muted">No open BNs in this mode</td>`
                        tbody.appendChild(message)
                    }
                } else if (tbody && tbody.children.length > 0) {
                    // remove message if exists
                    const existingMsg = tbody.querySelector("tr td.text-muted")
                    if (existingMsg && existingMsg.textContent.includes("No open BNs")) {
                        existingMsg.closest("tr")?.remove()
                    }
                }
            }, 100)
        })
    }
}
