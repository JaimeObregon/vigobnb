export const config = {
    columns: [
        {
            id: 'name',
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
            title: 'Precio por noche',
            template: property => `${property.price} €`,
            sort: {
                ascending: (a, b) => a['price'] - b['price'],
                descending: (a, b) => b['price'] - a['price'],
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
            title: 'Capacidad',
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