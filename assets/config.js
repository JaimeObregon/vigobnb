export const config = {
    columns: [
        {
            id: 'id',
            title: 'id',
            template: property => `<code>${property.id}</code>`,
            sort: {
                ascending: (a, b) => a['id'] - b['id'],
                descending: (a, b) => b['id'] - a['id'],
            },
        },
        {
            id: 'price',
            title: 'Precio por noche',
            template: property => `${property.price} €`,
            sort: {
                ascending: (a, b) => a['price'] - b['price'],
                descending: (a, b) => b['price'] - a['price'],
            },
        },
        {
            id: 'name',
            title: 'Descripción',
            template: property => `
                ${property.superhost ? '[Superhost]' : ''}
                <a href="https://www.airbnb.es/rooms/${property.id}">
                    ${property.name}
                </a>
                <br>
                ${property.details.join(' · ')}
                `,
            sort: {
                ascending: (a, b) => a['name'].localeCompare(b['name']),
                descending: (a, b) => b['name'].localeCompare(a['name']),
            },
        },
        {
            id: 'rating',
            title: 'Valoración media',
            template: property => property.rating ? property.rating.toLocaleString('es-ES') : '',
            sort: {
                ascending: (a, b) => a['rating'] - b['rating'],
                descending: (a, b) => b['rating'] - a['rating'],
            },
        },
        {
            id: 'capacity',
            title: 'Huéspedes',
            template: property => property.capacity,
            sort: {
                ascending: (a, b) => a['capacity'] - b['capacity'],
                descending: (a, b) => b['capacity'] - a['capacity'],
            },
        },
        {
            id: 'reviews',
            title: 'Reseñas',
            template: property => property.reviews,
            sort: {
                ascending: (a, b) => a['reviews'] - b['reviews'],
                descending: (a, b) => b['reviews'] - a['reviews'],
            },
        },
    ],
}
