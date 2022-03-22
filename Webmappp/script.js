// Specify the accessToken, the value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2h1bWFucXUiLCJhIjoiY2wxMTN1NjEzMDRkdjNqcjJpMDh3M3c2MSJ9.orB4lA6VuXpk5O5YCz2A6A";

/* 
To create a map view with a certain style you designed.
*/
const map = new mapboxgl.Map({
  container: "map",
  // Replace YOUR_STYLE_URL with your style URL.
  style: "mapbox://styles/shumanqu/cl11b6u8a000n15mr1twluv5l",
  center: [-0.1276, 51.5072], //Map centre, longitude, latitude
  zoom: 10 //Zoom level
});

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
  proximity: {
    longitude: 55.8642,
    latitude: 4.2518
  } // Coordinates of Glasgow center
});

//Add the my location control
map.addControl(new mapboxgl.GeolocateControl());

//To add the naigation control to the map to the top-right corner.
map.addControl(new mapboxgl.NavigationControl());

//To add a scale.
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80, //size of the scale bar
  unit: "metric"
});
map.addControl(scale);

map.on("click", (event) => {
  // If the user clicked on one of your markers, get its information.
  const features = map.queryRenderedFeatures(event.point, {
    layers: ["london-music-venues"] // replace with your layer name
  });

  if (!features.length) {
    return;
  }
  //This variable feature is the marker you clicked.
  //Feature has geometry and properties.
  //Properties are the columns in the attribute table.
  const feature = features[0];

  //Fly to the point when click.
  map.flyTo({
    center: feature.geometry.coordinates, //keep this
    zoom: 17 //change fly to zoom level
  });

  //Create a new pop up with the style defined in the CSS as my-popup.
  //
  const popup = new mapboxgl.Popup({ offset: [0, -15], className: "my-popup" })
    .setLngLat(feature.geometry.coordinates) //Set the loctaion of the pop up to the marker's long and lat using
    .setHTML(
      //Create some html with a heading h3, and two paragraphs p to display some properties of the marker.
      `<h3>Place name: ${feature.properties.name}</h3> 
  <p>Borough name: ${feature.properties.borough_name}</p>
  <p>Website: ${feature.properties.website}</p>`
    ) //${feature.properties.xxx} is used to refer to a certain property in the data.
    .addTo(map); //Add this pop up to the map.
});

map.on("load", () => {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource("Music_venues_all (1)", {
    type: "geojson", //keep this
    // Point to GeoJSON data. You can get an URL of your data uploaded to Mapbox
    // by replacing the access_token and the user name and the dataset id
    // https://api.mapbox.com/datasets/v1/<username>/<datasetid>/features/?access_token=<accesstoken>
    data:
      "https://api.mapbox.com/datasets/v1/shumanqu/cl119ihiq04o422mplzfn7oag/features/?access_token=pk.eyJ1Ijoic2h1bWFucXUiLCJhIjoiY2wxMWU2eDVuMDdkYjNjbnN5a2psM200ZSJ9.OEAe16RuGLCAYId02oLPWA",

    cluster: true, //keep this
    clusterMaxZoom: 10, // Max zoom to cluster points on, no cluster beyond this zoom level
    generateId: true, //keep this
    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters", //keep this
    type: "circle", //keep this
    source: "Music_venues_all (1)", //match the source name to the data source you added above
    filter: ["has", "point_count"], //keep this
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 10
      //   * Yellow, 25px circles when point count is between 10 and 20
      //   * Pink, 30px circles when point count is greater than or equal to 20
      "circle-color": [
        "step",
        ["get", "point_count"],
        "lightblue",
        10,
        "lightyellow",
        20,
        "pink"
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 10, 25, 20, 30]
    }
  });

  map.addLayer({
    id: "cluster-count", //keep this
    type: "symbol", //keep this
    source: "Music_venues_all (1)", //match the source name to the data source you added above
    filter: ["has", "point_count"], //keep this
    layout: {
      "text-field": "{point_count_abbreviated}", //keep this
      //you can change the font and size
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12
    }
  });
});