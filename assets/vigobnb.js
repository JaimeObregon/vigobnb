import { config } from "/assets/config.js";

const { columns } = config;
const { debounce } = throttleDebounce;

const formatDate = (locale, date) =>
    new Date(date).toLocaleString(locale, {
        day: "numeric",
        month: "numeric",
        year: "numeric",
    });

const fourWeeksFromNow = formatDate(
    "en-CA",
    new Date().setDate(new Date().getDate() + 4 * 7)
);
const fiveWeeksFromNow = formatDate(
    "en-CA",
    new Date().setDate(new Date().getDate() + 5 * 7)
);

const defaults = {
    from: fourWeeksFromNow,
    to: fiveWeeksFromNow,
    propertyTypes: "1",
    adults: 2,
    compact: true,
};

const error = (message) => `
    <bx-table-expanded-row colspan="${columns.length + 1}" expanded>
        <div class="empty">
            <img src="/assets/ooops.svg" alt="Ooops!!!" />
            ${message}
        </div>
    </bx-table-expanded-row>
`;

let properties;
let rows;

const refresh = debounce(350, async () => {
    table.innerHTML = [...Array(5)]
        .map(
            (row) => `
        <bx-table-expand-row>
            ${columns
                .map(() => `<bx-table-cell-skeleton></bx-table-cell-skeleton>`)
                .join("")}
        </bx-table-expand-row>
    `
        )
        .join("");

    const params = new URLSearchParams();
    params.append("checkin", controls.dates.value.split("/")[0]);
    params.append("checkout", controls.dates.value.split("/")[1]);
    params.append("adults", controls.adults.value);
    params.append("propertyTypeId", controls.types.value);
    const query = params.toString();

    const response = await fetch(`/.netlify/functions/airbnb-fetch?${query}`);

    if (!response.ok) {
        table.innerHTML = error(`
            <h1>No se pudo conectar con el servidor</h1>
            <p>
                Algo ha salido mal y no ha sido posible conectar<br>
                con el servidor o con la API de Airbnb.<br>
                Prueba a intentarlo de nuevo pasados unos minutos.
            </p>
        `);
        return;
    }

    const json = await response.json();

    if (!json.length) {
        table.innerHTML = error(`
            <h1>No hay resultados</h1>
            <p>
                Parece que no hay propiedades para tu búsqueda.<br>
                Prueba con otras fechas o cambiando los filtros.
            </p>
        `);
        return;
    }

    properties = json.filter(
        (value, index, array) =>
            array.findIndex((item) => item.id === value.id) === index
    );

    rows = (order, direction) =>
        properties
            .sort(columns.find((column) => column.id === order).sort[direction])
            .map(
                (property) => `
            <bx-table-expand-row>
                ${columns
                    .map(
                        (column) => `
                    <bx-table-cell class="${column.class}">
                        ${column.template(property)}
                    </bx-table-cell>
                `
                    )
                    .join("")}
            </bx-table-expand-row>
            <bx-table-expanded-row colspan="${columns.length + 1}">
                <div class="gallery">
                    ${property.pictures
                        .map((picture) => `<img src="${picture}" alt=""/>`)
                        .join("")}
                </div>
                <dl>
                    <dt>Superanfitrión:</dt>
                    <dd>${property.superhost ? "Sí" : "No"}</dd>
                    <dt>Nuevo:</dt>
                    <dd>${property.new ? "Sí" : "No"}</dd>
                </dl>
                <pre>${JSON.stringify(property.quote, null, 4)}</pre>
            </bx-table-expanded-row>
        `
            )
            .join("");

    table.innerHTML = rows("price", "descending");
});

document.body.innerHTML = `
    <bx-side-nav>
        <img src="/assets/anfitriona.png" alt="Anfitriona">

        <bx-date-picker date-format="d/m/Y" value="${defaults.from}/${
    defaults.to
}">
            <bx-date-picker-input value="${formatDate(
                "es-ES",
                defaults.from
            )}" kind="from" label-text="Fecha de entrada">
            </bx-date-picker-input>
            <bx-date-picker-input value="${formatDate(
                "es-ES",
                defaults.to
            )}" kind="to" label-text="Fecha de salida">
            </bx-date-picker-input>
        </bx-date-picker>

        <bx-number-input value="${
            defaults.adults
        }" placeholder="Optional placeholder text" min="1" max="20" type="text">
            <span slot="label-text">Huéspedes</span>
        </bx-number-input>

        <bx-multi-select value="${
            defaults.propertyTypes
        }" label-text="Tipo de alojamiento" trigger-content="Selecciona tipos">
            ${config.propertyTypes
                .map(
                    (type) => `
                    <bx-multi-select-item value="${type.id}">
                        ${type.name}
                    </bx-multi-select-item>
                `
                )
                .join("")}
        </bx-multi-select>

        <bx-toggle ${defaults.compact ? "" : 'checked=""'}>
            <span slot="checked-text">Mostrar fotografías</span>
            <span slot="unchecked-text">Ocultar fotografías</span>
        </bx-toggle>

        <button>
            <svg viewBox="0 0 32 32">
                <path fill="currentColor" d="M25.189,20.369c3.006,0,5.45-2.448,5.45-5.457c0-2.864-2.228-5.259-5.072-5.454c-0.182-0.013-0.325-0.159-0.335-0.341 c-0.197-3.79-3.322-6.758-7.114-6.758c-2.751,0-5.286,1.616-6.456,4.117c-0.081,0.174-0.287,0.253-0.463,0.18 c-0.864-0.355-1.774-0.535-2.706-0.535c-3.933,0-7.133,3.2-7.133,7.133c0,3.574,2.648,6.631,6.16,7.109 c0.197,0.026,0.335,0.208,0.308,0.405c-0.027,0.196-0.21,0.343-0.406,0.308c-3.867-0.526-6.782-3.89-6.782-7.822 c0-4.33,3.523-7.853,7.853-7.853c0.914,0,1.809,0.157,2.666,0.468c1.346-2.581,4.042-4.23,6.959-4.23 c4.07,0,7.443,3.107,7.811,7.13c3.07,0.368,5.432,3.007,5.432,6.143c-0.001,3.406-2.769,6.178-6.172,6.178 c-0.009,0-0.089-0.004-0.098-0.005c-0.194-0.015-0.372-0.183-0.362-0.378s0.125-0.364,0.338-0.345L25.189,20.369z" />
                <polygon fill="currentColor" points="16,30.509 9.746,24.255 10.254,23.745 15.64,29.131 15.64,13 16.36,13 16.36,29.131 21.745,23.745 22.255,24.255 "/>
            </svg>
        </button>
    </bx-side-nav>
    <bx-data-table>
        <bx-table compact="">
            <bx-table-head>
                <bx-table-header-row>
                    <bx-table-header-cell></bx-table-header-cell>
                    ${columns
                        .map(
                            (column) => `
                        <bx-table-header-cell data-id="${column.id}" class="${column.class}" sort-direction="none" sort-cycle="bi-states-from-ascending">
                            ${column.title}
                        </bx-table-header-cell>
                    `
                        )
                        .join("")}
                </bx-table-header-row>
            </bx-table-head>
            <bx-table-body>
            </bx-table-body>
        </bx-table>
    </bx-data-table>
`;

const controls = {
    dates: document.querySelector("bx-date-picker"),
    adults: document.querySelector("bx-number-input"),
    types: document.querySelector("bx-multi-select"),
};
const table = document.querySelector("bx-table-body");

document.addEventListener("bx-table-header-cell-sort", (event) => {
    const column = event.target.dataset.id;
    const direction = event.detail.sortDirection;
    const headers = document.querySelectorAll("bx-table-header-cell");

    table.innerHTML = rows(column, direction);
    headers.forEach((header) => header.setAttribute("sort-direction", "none"));
});

document
    .querySelector("bx-toggle")
    .addEventListener("bx-toggle-changed", (event) => {
        const value = Boolean(event.target.checked);
        document.querySelector("bx-table").toggleAttribute("compact", !value);
    });

document.querySelector("button").addEventListener("click", (event) => {
    const csv = [
        columns
            .map((column) => column.title)
            .map((field) => `"${field}"`)
            .join(","),
        ...properties.map((row) =>
            columns
                .map((column) => row[column.id])
                .map(String)
                .map((field) => field.replace(/^null$/, ""))
                .map((field) => field.replaceAll('"', '""'))
                .map((field) => `"${field}"`)
                .join(",")
        ),
    ].join("\r\n");

    const uri = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
    window.open(uri);
});

controls.adults.addEventListener("bx-number-input", refresh);

controls.types.addEventListener("bx-multi-select-selected", refresh);

controls.dates.addEventListener("bx-date-picker-changed", (event) => {
    event.detail.selectedDates.length === 2 && refresh();
});

refresh();
