import { config } from '/assets/config.js'

const { columns } = config

document.body.innerHTML = `
    <bx-side-nav>
        <img src="/assets/anfitriona.png" alt="Anfitriona">

        <bx-date-picker date-format="d/m/Y" value="2021-11-07/2021-11-07">
            <bx-date-picker-input kind="from" label-text="Fecha de llegada" value="07/11/2021">
            </bx-date-picker-input>
            <bx-date-picker-input kind="to" label-text="Fecha de salida" value="07/11/2021">
            </bx-date-picker-input>
        </bx-date-picker>

        <bx-multi-select value="1" label-text="Tipo de propiedad" trigger-content="Selecciona tipos">
            ${config.propertyTypes
                .map(type => `
                    <bx-multi-select-item value="${type.id}">
                        ${type.name}
                    </bx-multi-select-item>
                `).join('')}
        </bx-multi-select>

        <bx-number-input value="2" placeholder="Optional placeholder text" min="1" max="20" type="text">
            <span slot="label-text">Número de huéspedes</span>
        </bx-number-input>

        <bx-toggle>
            <span slot="checked-text">Mostrar fotografías</span>
            <span slot="unchecked-text">Ocultar fotografías</span>
        </bx-toggle>
    </bx-side-nav>
    <bx-data-table>
        <bx-table hideimages="">
            <bx-table-head>
                <bx-table-header-row>
                    <bx-table-header-cell></bx-table-header-cell>
                    ${columns.map(column => `
                        <bx-table-header-cell data-id="${column.id}" sort-direction="none" sort-cycle="bi-states-from-ascending">
                            ${column.title}
                        </bx-table-header-cell>
                    `).join('')}
                </bx-table-header-row>
            </bx-table-head>
            <bx-table-body>
            </bx-table-body>
        </bx-table>
    </bx-data-table>
`

const refresh = async () => {
    document.querySelector('bx-table-body').innerHTML = [...Array(15)].map(row => `
        <bx-table-expand-row>
            ${columns.map(column => `
                <bx-table-cell-skeleton></bx-table-cell-skeleton>
            `).join('')}
        </bx-table-expand-row>
    `).join('')

    const [ checkin, checkout ] = document.querySelector('bx-date-picker').value.split('/')
    const propertyTypeId = document.querySelector('bx-multi-select').value
    const adults = document.querySelector('bx-number-input').value

    const params = new URLSearchParams()
    params.append('checkin', checkin)
    params.append('checkout', checkout)
    params.append('adults', adults)
    params.append('propertyTypeId', propertyTypeId)

    const query = params.toString()

    const response = await fetch(`/.netlify/functions/airbnb-fetch?${query}`)

    if (!response.ok) {
        // ...
    }

    const json = await response.json()

    if (!json.length) {
        // ...
        document.querySelector('bx-table-body').innerHTML = `
            <bx-table-expanded-row colspan="${columns.length + 1}" expanded>
                <div class="empty">
                    <h1>No hay resultados</h1>
                    <p>
                        Parece que no hay propiedades para tu búsqueda.<br>
                        Prueba con otras fechas o cambiando los filtros.
                    </p>
                </div>
            </bx-table-expanded-row>
        `
        return
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
}

refresh()

document.addEventListener('bx-table-header-cell-sort', event => {
    const column = event.target.dataset.id
    const direction = event.detail.sortDirection

    const table = document.querySelector('bx-table-body')
    const headers = document.querySelectorAll('bx-table-header-cell')

    table.innerHTML = rows(column, direction)
    headers.forEach(header => header.setAttribute('sort-direction', 'none'))
})

document.addEventListener('bx-date-picker-changed', event => {
    event.detail.selectedDates.length === 2 && refresh()
})

document.querySelector('bx-number-input').addEventListener('bx-number-input', refresh)

document.querySelector('bx-multi-select').addEventListener('bx-multi-select-selected', refresh)

document.querySelector('bx-toggle').addEventListener('bx-toggle-changed', event => {
    const value = Boolean(event.target.checked)
    document.querySelector('bx-table').toggleAttribute('hideimages', !value)
})
