import { config } from '/assets/config.js'

const { columns } = config
const { debounce } = throttleDebounce

const formatDate = (locale, date) => new Date(date)
    .toLocaleString(locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    })

const fourWeeksFromNow = new Date(new Date().setDate(new Date().getDate() + 4 * 7))
const fiveWeeksFromNow = new Date(new Date().setDate(new Date().getDate() + 5 * 7))

const defaults = {
    from: fourWeeksFromNow,
    to: fiveWeeksFromNow,
    propertyTypes: '1',
    adults: 2,
    compact: true,
}

const error = message => `
    <bx-table-expanded-row colspan="${columns.length + 1}" expanded>
        <div class="empty">
            <img src="/assets/ooops.svg" alt="Ooops!!!" />
            ${message}
        </div>
    </bx-table-expanded-row>
`

const refresh = debounce(350, async () => {
    table.innerHTML = [...Array(5)].map(row => `
        <bx-table-expand-row>
            ${columns.map(column => `<bx-table-cell-skeleton></bx-table-cell-skeleton>`).join('')}
        </bx-table-expand-row>
    `).join('')

    const params = new URLSearchParams()
    params.append('checkin', controls.dates.value.split('/')[0])
    params.append('checkout', controls.dates.value.split('/')[1])
    params.append('adults', controls.adults.value)
    params.append('propertyTypeId', controls.types.value)
    const query = params.toString()

    const response = await fetch(`/.netlify/functions/airbnb-fetch?${query}`)

    if (!response.ok) {
        table.innerHTML = error(`
            <h1>No se pudo conectar con el servidor</h1>
            <p>
                Algo ha salido mal y no ha sido posible conectar<br>
                con el servidor o con la API de Airbnb.<br>
                Prueba a intentarlo de nuevo.
            </p>
        `)
        return
    }

    const json = await response.json()

    if (!json.length) {
        table.innerHTML = error(`
            <h1>No hay resultados</h1>
            <p>
                Parece que no hay propiedades para tu búsqueda.<br>
                Prueba con otras fechas o cambiando los filtros.
            </p>
        `)
        return
    }

    const properties = json
        .filter((value, index, array) => array.findIndex(item => (item.id === value.id)) === index)

    const rows = (order, direction) => properties
        .sort(columns.find(column => column.id === order).sort[direction])
        .map(property => `
            <bx-table-expand-row>
                ${columns.map(column => `
                    <bx-table-cell class="${column.class}">
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

    table.innerHTML = rows('price', 'descending')
})

document.body.innerHTML = `
    <bx-side-nav>
        <img src="/assets/anfitriona.png" alt="Anfitriona">

        <bx-date-picker date-format="d/m/Y" value="${defaults.from}/${defaults.to}">
            <bx-date-picker-input value="${formatDate('es-ES', defaults.from)}" kind="from" label-text="Fecha de entrada">
            </bx-date-picker-input>
            <bx-date-picker-input value="${formatDate('es-ES', defaults.to)}" kind="to" label-text="Fecha de salida">
            </bx-date-picker-input>
        </bx-date-picker>

        <bx-multi-select value="${defaults.propertyTypes}" label-text="Tipo de alojamiento" trigger-content="Selecciona tipos">
            ${config.propertyTypes
                .map(type => `
                    <bx-multi-select-item value="${type.id}">
                        ${type.name}
                    </bx-multi-select-item>
                `).join('')}
        </bx-multi-select>

        <bx-number-input value="${defaults.adults}" placeholder="Optional placeholder text" min="1" max="20" type="text">
            <span slot="label-text">Huéspedes</span>
        </bx-number-input>

        <bx-toggle ${defaults.compact ? '' : 'checked=""'}>
            <span slot="checked-text">Mostrar fotografías</span>
            <span slot="unchecked-text">Ocultar fotografías</span>
        </bx-toggle>
    </bx-side-nav>
    <bx-data-table>
        <bx-table compact="">
            <bx-table-head>
                <bx-table-header-row>
                    <bx-table-header-cell></bx-table-header-cell>
                    ${columns.map(column => `
                        <bx-table-header-cell data-id="${column.id}" class="${column.class}" sort-direction="none" sort-cycle="bi-states-from-ascending">
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

const controls = {
    dates: document.querySelector('bx-date-picker'),
    adults: document.querySelector('bx-number-input'),
    types: document.querySelector('bx-multi-select'),
}
const table = document.querySelector('bx-table-body')

document.addEventListener('bx-table-header-cell-sort', event => {
    const column = event.target.dataset.id
    const direction = event.detail.sortDirection
    const headers = document.querySelectorAll('bx-table-header-cell')

    table.innerHTML = rows(column, direction)
    headers.forEach(header => header.setAttribute('sort-direction', 'none'))
})

document.querySelector('bx-toggle').addEventListener('bx-toggle-changed', event => {
    const value = Boolean(event.target.checked)
    document.querySelector('bx-table').toggleAttribute('compact', !value)
})

controls.adults.addEventListener('bx-number-input', refresh)

controls.types.addEventListener('bx-multi-select-selected', refresh)

controls.dates.addEventListener('bx-date-picker-changed', event => {
    event.detail.selectedDates.length === 2 && refresh()
})

refresh()
