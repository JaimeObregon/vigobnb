document.body.innerHTML = `
	<h1>Hello world!</h1>
`

const response = await fetch('/.netlify/functions/airbnb-fetch')

if (!response.ok) {
    // ...
}

const data = await response.json()

if (!data.length) {
    // ...
}

const rows = data.map(property => `
    <tr>
        <td>
            <code>${property.id}</code>
        </td>
        <td>
            <a href="https://www.airbnb.es/rooms/${property.id}">
                ${property.name}
            </a>
        </td>
    </tr>
`)

document.body.innerHTML += `
<table>
    ${rows.join('')}
</table>
`
