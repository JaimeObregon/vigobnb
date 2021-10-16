const fetch = require('node-fetch')

const endpoint = 'https://www.airbnb.es/api/v3/ExploreSections'

const variables = {
    isInitialLoad: true,
    hasLoggedIn: false,
    cdnCacheSafe: false,
    source: 'EXPLORE',
    exploreRequest: {
        metadataOnly: false,
        version: '1.8.2',
        itemsPerGrid: 50,
        tabId: 'home_tab',
        refinementPaths: [
            '/homes',
        ],
        flexibleTripDates: [
            'november',
            'october',
        ],
        flexibleTripLengths: [
            'weekend_trip',
        ],
        datePickerType: 'calendar',
        placeId: 'ChIJKYOZ6mqKJQ0RkBjLc4L1BAQ',
        checkin: '2021-11-15',
        checkout: '2021-11-22',
        source: 'structured_search_input_header',
        searchType: 'autocomplete_click',
        // federatedSearchSessionId: '7b2e3150-3f40-413b-bde3-2a2a1de09b95',
        // itemsOffset: 0,
        // sectionOffset: 2,
        query: 'Vigo, Pontevedra',
        cdnCacheSafe: false,
        treatmentFlags: [
            'flex_destinations_june_2021_launch_web_treatment',
            'flexible_dates_options_extend_one_three_seven_days',
            'super_date_flexibility',
            'search_input_placeholder_phrases'
        ],
        screenSize: 'large',
        isInitialLoad: true,
        hasLoggedIn: false
    }
}

const extensions = {
    persistedQuery: {
        version: 1,
        sha256Hash: '8a40295debb15f7cfe2360f2f8fd6bb7e8df337b488cc587d4ad9ba1c4afba1c',
    }
}

const parseResults = results => {
    const items = results
        .data
        .presentation
        .explore
        .sections
        .sections
        .find(section => section.section.__typename === 'ExploreSectionWrapper')
        .section
        .child
        .section
        .items

    const properties = items
        .map(item => ({
            name: item.listing.name,
            lat: item.listing.lat,
            lng: item.listing.lng,
            id: item.listing.id,
            pricing: item.pricingQuote.price.priceItems,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

        console.log('properties:')
        console.log(properties)
    return properties || []
}

const handler = async function () {
    const maxPages = 2
    const properties = []
    let page = 0

    do {
        const itemsOffset = variables.exploreRequest.itemsPerGrid * page

        const params = new URLSearchParams()
        params.append('operationName', 'ExploreSections')
        params.append('locale', 'es')
        params.append('currency', 'EUR')
        params.append('variables', JSON.stringify({
            ...variables,
            exploreRequest: {
                ...variables.exploreRequest,
                itemsOffset,
            }
        }))
        params.append('extensions', JSON.stringify(extensions))

        const url = `${endpoint}?` + params.toString()

        const response = await fetch(url, {
            headers: {
                'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
            },
        })

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: response.statusText,
            }
        }

        const results = await response.json()

        const items = parseResults(results)
        if (!items.length) {
            break
        }

        properties.push(...items)
    } while (++page < maxPages)

    return {
        statusCode: 200,
        body: JSON.stringify(properties),
    }
}

module.exports = { handler }