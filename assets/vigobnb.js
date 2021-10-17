import { config } from '/assets/config.js'

document.body.innerHTML = `
    <bx-loading></bx-loading>
`

const checkin = '2021-11-16'
const checkout = '2021-11-16'

const params = new URLSearchParams()
params.append('checkin', checkin)
params.append('checkout', checkout)

const query = params.toString()

const response = await fetch(`/.netlify/functions/airbnb-fetch?${query}`)

if (!response.ok) {
    // ...
}

const properties = await response.json()

if (!properties.length) {
    // ...
}

const { columns } = config

const rows = (order, direction) => properties
    .sort(columns.find(column => column.id === order).sort[direction])
    .map(property => `
        <bx-table-row>
            ${columns.map(column => `
                <bx-table-cell class="${column.id}">
                    ${column.template(property)}
                </bx-table-cell>
            `).join('')}
        </bx-table-row>
    `)
    .join('')

document.body.innerHTML = `
<!--
    <bx-side-nav expanded="">
        <bx-side-nav-items>
            <bx-side-nav-menu title="xxx">
                <bx-side-nav-menu-item>
                    <bx-date-picker dateFormat="d/m/Y" datePickerType="simple">
                        <bx-date-picker-input kind="from" label-text="Fecha de llegada" placeholder="xx/xx/xxxx">
                        </bx-date-picker-input>
                        <bx-date-picker-input kind="to" label-text="Fecha de partida" placeholder="xx">
                        </bx-date-picker-input>
                    </bx-date-picker>
                </bx-side-nav-menu-item>
            </bx-side-nav-menu>
        </bx-side-nav-items>
    </bx-side-nav>
-->
    <bx-data-table>
        <bx-table>
            <bx-table-head>
                <bx-table-header-row>
                    ${columns.map(column => `
                        <bx-table-header-cell data-id="${column.id}" sort-direction="none" sort-cycle="bi-states-from-ascending">
                            ${column.title}
                        </bx-table-header-cell>
                    `).join('')}
                </bx-table-header-row>
            </bx-table-head>
            <bx-table-body>
                ${rows('price', 'descending')}
            </bx-table-body>
        </bx-table>
    </bx-data-table>
`

document.addEventListener('bx-table-header-cell-sort', event => {
    const column = event.target.dataset.id
    const direction = event.detail.sortDirection
    document.querySelector('bx-table-body').innerHTML = rows(column, direction)
})
