import { config } from '/assets/config.js'

const { columns } = config

document.body.innerHTML = `
    <bx-side-nav>
        <img src="/assets/anfitriona.png" alt="Anfitriona">

        <bx-date-picker date-format="d/m/Y">
            <bx-date-picker-input kind="from" label-text="Fecha de llegada">
            </bx-date-picker-input>
            <bx-date-picker-input kind="to" label-text="Fecha de salida">
            </bx-date-picker-input>
        </bx-date-picker>

        <bx-multi-select label-text="Tipo de propiedad" value="foo,baz" trigger-content="Selecciona tipos">
            <bx-multi-select-item value="foo">Apartamento</bx-multi-select-item>
            <bx-multi-select-item value="bar">No sé qué</bx-multi-select-item>
            <bx-multi-select-item value="baz">No sé cuál</bx-multi-select-item>
        </bx-multi-select>

        <bx-number-input value="2" placeholder="Optional placeholder text" min="1" max="20" type="text">
            <span slot="label-text">Número de huéspedes</span>
        </bx-number-input>

        <bx-toggle>
            <span slot="checked-text">Solo superanfitriones</span>
            <span slot="unchecked-text">Todos los anfitriones</span>
        </bx-toggle>
    </bx-side-nav>
    <bx-data-table>
        <bx-table>
            <bx-table-head>
                <bx-table-header-expand-row>
                    ${columns.map(column => `
                        <bx-table-header-cell data-id="${column.id}" sort-direction="none" sort-cycle="bi-states-from-ascending">
                            ${column.title}
                        </bx-table-header-cell>
                    `).join('')}
                </bx-table-header-expand-row>
            </bx-table-head>
            <bx-table-body>
                ${[...Array(50)].map(row => `
                    <bx-table-expand-row>
                        ${columns.map(column => `
                            <bx-table-cell-skeleton></bx-table-cell-skeleton>
                        `).join('')}
                    </bx-table-expand-row>
                `).join('')}
            </bx-table-body>
        </bx-table>
    </bx-data-table>
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

const json = await response.json()

if (!json.length) {
    // ...
}

const properties = json
    .filter((value, index, array) => array.findIndex(item => (item.id === value.id)) === index)

const rows = (order, direction) => properties
    .sort(columns.find(column => column.id === order).sort[direction])
    .map(property => `
        <bx-table-expand-row>
            ${columns.map(column => `
                <bx-table-cell class="${column.id}">
                    ${column.template(property)}
                </bx-table-cell>
            `).join('')}
        </bx-table-expand-row>
        <bx-table-expanded-row colspan="${columns.length + 1}">
            <code>${property.id}</code>
            ${property.pictures.map(picture => `<img src="${picture}" alt="" style="height: 5rem" />`).join('')}
            ${property.superhost ? 'Superanfitrión' : 'No es superanfitrión'}
        </bx-table-expanded-row>
    `)
    .join('')

document.querySelector('bx-table-body').innerHTML = rows('price', 'descending')

document.addEventListener('bx-table-header-cell-sort', event => {
    const column = event.target.dataset.id
    const direction = event.detail.sortDirection

    const table = document.querySelector('bx-table-body')
    const headers = document.querySelectorAll('bx-table-header-cell')

    table.innerHTML = rows(column, direction)
    headers.forEach(header => header.setAttribute('sort-direction', 'none'))
})

document.addEventListener('bx-table-row-expando-toggled-all', event => {
    const rows = document.querySelectorAll('bx-table-expand-row')
    rows.forEach(row => row.toggleAttribute('expanded', event.detail.expanded))
})
