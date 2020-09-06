// code for creating Basic Map (Level 1)
// Store our API endpoint as queryUrl
// const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

function createMap(features) {


    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    const overLay = {
        earthquakes: features
    }

    const layout = {
        collapsed: false
    }


    // Create a new map
    const myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [darkmap, features]
    });

    // Create a layer control containing our baseMaps
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    L.control.layers(baseMaps, overLay, layout).addTo(myMap);
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 250, 500, 750, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

}

function createMarkers(reponseData) {

    const features = L.geoJSON(reponseData, {
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng);
        },
        style: function (geoJsonFeature) {
            console.log(geoJsonFeature)
            return {
                radius: setsize(geoJsonFeature.properties.mag),
                opacity: 0.6,
                fillOpacity: 0.6,
                color: getColor(geoJsonFeature.properties.sig)
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
            <h2>Earthquake: ${feature.properties.place}</h2>
            <hr>
            <h4>Time: ${new Date(feature.properties.time)}</h4>
            <hr>
            <h4>Magnitued: ${feature.properties.mag}</h4>
            <hr>
            <h4>Significance: ${feature.properties.sig}</h4>
            `)
        }
    })

    createMap(features)
}

function getColor(d) {
    return d > 1000 ? '#C9565E' :
        d > 750 ? '#EB7B6f' :
            d > 500 ? '#F0A591' :
                d > 250 ? '#F1D1C3' :
                    '#FFFFFF';
}

function setsize(d) {
    return d > 5 ? d * 10 :
        d > 4 ? d * 8 :
            d > 3 ? d * 2 :
                d > 2 ? d :
                    d > 1 ? d :
                        0.5;
}


// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    console.log(data.features);
    console.log("features");
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map

    createMarkers(data.features)

});

