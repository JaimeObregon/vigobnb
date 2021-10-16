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

const data = await response.json()

if (!data.length) {
    // ...
}

const rows = data.map(property => `
    <bx-table-row>
        <bx-table-cell>
            <code>${property.id}</code>
        </bx-table-cell>
        <bx-table-cell class="price">
            ${property.pricing} €
        </bx-table-cell>
        <bx-table-cell>
            <a href="https://www.airbnb.es/rooms/${property.id}">
                ${property.name}
            </a>
        </bx-table-cell>
    </bx-table-row>
`)

const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}
document.body.innerHTML = `
<h1>
    Resultados de ${new Date(checkin).toLocaleDateString('es-ES', options)} a ${new Date(checkout).toLocaleDateString('es-ES', options)}
</h1>
<bx-data-table>
    <bx-table>
        <bx-table-head>
            <bx-table-header-row>
                <bx-table-header-cell>id</bx-table-header-cell>
                <bx-table-header-cell>Precio por noche</bx-table-header-cell>
                <bx-table-header-cell>Nombre</bx-table-header-cell>
            </bx-table-header-row>
        </bx-table-head>
        <bx-table-body>
            ${rows.join('')}
        </bx-table-body>
    </bx-table>
</bx-data-table>
`
