const fetch = require("node-fetch");

const endpoint = "https://www.airbnb.es/api/v3/ExploreSections";

const headers = {
    "X-Airbnb-API-Key": "d306zoyjsyarp7ifhu67rjxn52tv0t20",
};

const variables = {
    isInitialLoad: true,
    hasLoggedIn: false,
    cdnCacheSafe: false,
    source: "EXPLORE",
    exploreRequest: {
        metadataOnly: false,
        version: "1.8.3",
        itemsPerGrid: 50,
        tabId: "home_tab",
        refinementPaths: ["/homes"],
        flexibleTripDates: ["november", "october"],
        flexibleTripLengths: ["weekend_trip"],
        datePickerType: "calendar",
        source: "structured_search_input_header",
        searchType: "filter_change",
        roomTypes: [
            "Entire home/apt", // "Alojamiento entero"
            // 'Private room', // "Habitación privada"
        ],
        // federatedSearchSessionId: '7b2e3150-3f40-413b-bde3-2a2a1de09b95',
        // sectionOffset: 2,
        cdnCacheSafe: false,
        treatmentFlags: [
            "flex_destinations_june_2021_launch_web_treatment",
            "flexible_dates_options_extend_one_three_seven_days",
            "super_date_flexibility",
            "search_input_placeholder_phrases",
        ],
        screenSize: "large",
        isInitialLoad: true,
        hasLoggedIn: false,
    },
};

const extensions = {
    persistedQuery: {
        version: 1,
        sha256Hash:
            "8a40295debb15f7cfe2360f2f8fd6bb7e8df337b488cc587d4ad9ba1c4afba1c",
    },
};

const parseResults = (results) => {
    const items = results.data.presentation.explore.sections.sections.find(
        (section) =>
            section.section.__typename === "ExploreSectionWrapper" &&
            section.section.child.section.items
    ).section.child.section.items;

    if (!items) {
        return [];
    }

    const properties = items.map((item) => ({
        name: item.listing.name,
        rating: item.listing.avgRating,
        capacity: item.listing.personCapacity,
        reviews: item.listing.reviewsCount,
        details: item.listing.homeDetails
            .filter((detail) => detail.__typename === "BasicListItem")
            .map((detail) => detail.title),
        price: item.pricingQuote.structuredStayDisplayPrice.primaryLine.price,
        total: item.pricingQuote.structuredStayDisplayPrice.secondaryLine.price,
        id: item.listing.id,
        quote: item.pricingQuote,
        superhost: item.listing.isSuperhost,
        new: item.listing.isNewListing,
        pictures: item.listing.contextualPictures
            .filter((picture) => picture.__typename === "ExplorePicture")
            .map((picture) => picture.picture),
    }));

    return properties || [];
};

const handler = async (event) => {
    const maxPages = 8; // Hay un máximo de 400 apartamentos y los obtenemos en páginas de 50
    const properties = [];
    let page = 0;

    const { checkin, checkout, adults, query, propertyTypeId } =
        event.queryStringParameters;

    do {
        const itemsOffset = variables.exploreRequest.itemsPerGrid * page;

        const params = new URLSearchParams();
        params.append("operationName", "ExploreSections");
        params.append("locale", "es");
        params.append("currency", "EUR");
        params.append(
            "variables",
            JSON.stringify({
                ...variables,
                exploreRequest: {
                    ...variables.exploreRequest,
                    adults: Number(adults),
                    query,
                    propertyTypeId: [
                        ...propertyTypeId.split(",").map((id) => Number(id)),
                    ],
                    checkin,
                    checkout,
                    itemsOffset,
                },
            })
        );
        params.append("extensions", JSON.stringify(extensions));

        const url = `${endpoint}?` + params.toString();

        const response = await fetch(url, { headers });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: response.statusText,
            };
        }

        const results = await response.json();

        const items = parseResults(results);
        if (!items.length) {
            break;
        }

        properties.push(...items);
    } while (++page < maxPages);

    return {
        statusCode: 200,
        body: JSON.stringify(properties),
    };
};

module.exports = { handler };
