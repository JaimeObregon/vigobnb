export const config = {
    propertyTypes: [
        {
            id: 47,
            name: 'Apartamento con servicios',
        },
        {
            id: 37,
            name: 'Apartamento en complejo residencial',
        },
        {
            id: 1,
            name: 'Apartamento',
        },
        {
            id: 35,
            name: 'Loft',
        },
        // {
        //     id: 36,
        //     name: 'Adosado',
        // },
        // {
        //     id: 4,
        //     name: 'Cabaña',
        // },
        // {
        //     id: 40,
        //     name: 'Casa de invitados',
        // },
        // {
        //     id: 60,
        //     name: 'Casa rural',
        // },
        // {
        //     id: 2,
        //     name: 'Casa',
        // },
        // {
        //     id: 22,
        //     name: 'Chalet',
        // },
        // {
        //     id: 53,
        //     name: 'Suite con entrada independiente',
        // },
        // {
        //     id: 11,
        //     name: 'Villa',
        // },
    ],
    columns: [
        {
            id: 'name',
            class: 'details',
            title: 'Descripción',
            template: property => `
                <img src="${property.pictures[0]}" alt="" />
                <div>
                    <a href="https://www.airbnb.es/rooms/${property.id}">
                        ${property.name}
                    </a>
                    <ul>
                        ${property.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
                `,
            sort: {
                ascending: (a, b) => a['name'].localeCompare(b['name']),
                descending: (a, b) => b['name'].localeCompare(a['name']),
            },
        },
        {
            id: 'price',
            class: 'number price',
            title: 'Precio',
            template: property => `${property.price} €`,
            sort: {
                ascending: (a, b) => a['price'] - b['price'],
                descending: (a, b) => b['price'] - a['price'],
            },
        },
        {
            id: 'rating',
            class: 'number',
            title: 'Valoración',
            template: property => property.rating ? property.rating.toLocaleString('es-ES') : '',
            sort: {
                ascending: (a, b) => a['rating'] - b['rating'],
                descending: (a, b) => b['rating'] - a['rating'],
            },
        },
        {
            id: 'capacity',
            class: 'number',
            title: 'Capacidad',
            template: property => property.capacity,
            sort: {
                ascending: (a, b) => a['capacity'] - b['capacity'],
                descending: (a, b) => b['capacity'] - a['capacity'],
            },
        },
        {
            id: 'reviews',
            class: 'number',
            title: 'Reseñas',
            template: property => property.reviews,
            sort: {
                ascending: (a, b) => a['reviews'] - b['reviews'],
                descending: (a, b) => b['reviews'] - a['reviews'],
            },
        },
    ],
}
