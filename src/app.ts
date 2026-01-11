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

    static injectStyles() {
        if (document.querySelector("#bnm-filter-styles")) return

        const style = document.createElement("style")
        style.id = "bnm-filter-styles"
        style.textContent = `
        html, body {
                scrollbar-gutter: stable both-edges;
        }

        a#mgsite {
            position: absolute;
        }

        /* flex tables vertically */
        section div.row[mode="out-in"] {
            flex-direction: column !important;
        }

        .bn-cards-grid {
            /* 基础行样式 */
            --card-min-width: 250px;
            --card-max-width: 300px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(var(--card-min-width), 100%), 1fr));

            --gutter-x: 1rem;  /* 对应 g-3 */

            --gutter-y: 1rem;  /* 对应 g-3 */

            margin-top: var(--gutter-y);
            gap: var(--gutter-y) var(--gutter-x);

            .card-col {
                width: 100%;
                // max-width: 300px;
            }
        }

        .bn-mode-section {
            width: 100%;
            padding: 0 1rem;

            .mode-title {
                margin-bottom: 1rem;
            }

            .bn-cards-grid {
                width: 100%;
            }
        }

        .bn-cards-grid .home-card {
            height: 100%;
            margin-bottom: 0 !important;
            border-radius: 10px !important;
            overflow: hidden;
            border: none !important;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2) !important;
            min-height: 55px !important;
            width: 100% !important;
            padding-left: .9rem !important;

            img.card-avatar-img {
                top: 0;
            }

            span[data-original-title="view request info"] {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
        }
        
        .bn-cards-grid .home-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4) !important;
            z-index: 10;
        }
        
        .bn-closed:hover {
            transform: translateY(-1px) !important;
        }
        `
        document.head.appendChild(style)
    }

    static async improveTablesDisplay() {
        await DomWaiter.waitForBNTables()

        this.injectStyles()

        const tablesContainer = document.querySelector("section.card.card-body .row.align-items-start")
        if (!tablesContainer) {
            console.log("Tables container not found")
            return
        }

        // tablesContainer.classList.remove("align-items-start")
        // tablesContainer.classList.add("align-items-center")

        const tables = tablesContainer.querySelectorAll("table.table-dark")
        tables.forEach((table) => {
            // save thead
            const thead = table.querySelector("thead")
            const modeName = thead ? thead.textContent.trim() : ""

            const rows = table.querySelectorAll("tbody tr")

            const container = document.createElement("div")
            container.className = "bn-mode-section mb-5"

            if (modeName) {
                const titleDiv = document.createElement("div")
                titleDiv.className = "mode-title mb-3 pb-2 border-bottom border-secondary"
                titleDiv.innerHTML = `
                    <h5 class="text-light mb-0">
                        ${modeName} (${rows.length} BNs)
                    </h5>
                `
                container.appendChild(titleDiv)
            }
            const cardsContainer = document.createElement("div")
            cardsContainer.className = "bn-cards-grid"
            container.appendChild(cardsContainer)

            // create cards for each row
            rows.forEach((row) => {
                const cardDiv = row.querySelector(".home-card")
                if (!cardDiv) return

                const cardCol = document.createElement("div")
                cardCol.className = "card-col"
                const newCard = cardDiv.cloneNode(true) as HTMLElement

                // check if closed
                const isClosed = newCard.querySelector('.badge-danger[title="closed"]')

                // add extra style classes
                if (isClosed) {
                    newCard.classList.add("bn-closed")
                    newCard.style.opacity = "0.6"
                } else {
                    newCard.classList.add("bn-open")
                }

                // add hover effect
                newCard.style.transition = "all 0.2s ease"
                newCard.style.cursor = "pointer"

                cardCol.appendChild(newCard)
                cardsContainer.appendChild(cardCol)
            })

            // 7. replace table
            table.parentNode?.replaceChild(container, table)
        })
    }
}
