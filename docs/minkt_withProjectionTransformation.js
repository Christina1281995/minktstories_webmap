function init () {
   
    // ESRI Token for image URLs
    var token = "?token=I7TegBVc1f6x0trhZM9vqvr7h7yBhgoEyQDVQe2G4HO9g1FvBilhOcrqqxqaUMD8I7vGldeDUUmVCxySP5rCQLarp4bJWaSYS8a1fReBt7VJ8rWnLUQ7sg8s4U5W8bqI1twaQtnzJdphkP00RyJFjpHlEHpXn7sLyQsVDhd9TnDpDDfc9u7o6YowaRsiVieLrltzhD5Qvg2HKb1VO_I_Qhwm3bzZcF8I6BE7isShmzLpYuuM5ORXDpd7qfAtyRR7' ";
    // var token = "?token=G4BQFTxq13VZ8VOAfkwJTOL5OdJagHoFS1x1--y0hnoEUr8DLw7rDz3q-0OUd9DM3MmW6gmBUg0R_hnFACGGkaOIxP1tB35S8xlCwscv0CjZNFMhwsiuafYGynM8UroMEkXKau9RCTju1G7f1vi3gyV263FOTltqJDiVkQMmKy_N4shZTdIYiMc5LMfpsBe1PXJHyWV9D3KMzSUBKMRfuqJiisEl2DvJ5UxsV2MsXFC0TOgJY-kjKhni1_j5Rp8W' ";

    /*
    BASE LAYERS
    */

    var styles = ['Road', 'Aerial','AerialWithLabels'];
    var bingKey = 'Atoz1wDioRmjCFJbh0EYKVbNhY1FpWn2hyBGodCxBwsbWmxEP9Il16k9qcBBLXWk';

    // Bing Layers
    var bingLayers = [];
    let i, ii;
    for (i =0, ii = styles.length; i < ii; ++i) {
        bingLayers.push(
            new ol.layer.Tile({
                //title: styles[i],
                title: styles[i].split(/(?=[A-Z])/).join(" "), //ArealWithLabels -> Areal With Labels
                type: 'base',
                visible: true,
                preload: Infinity,
                source: new ol.source.BingMaps({
                    key: bingKey,
                    imagerySet: styles[i]
                }),
            })
        );
    }//for

    //OSM layer
    var osm = new ol.layer.Tile({
        title: 'OSM',
        type: 'base',
        visible: true,
        source: new ol.source.OSM()
    })

    // Combining base layers in array for layer switcher
    bingLayers.push(osm);

    /*
    WFS INTEGRATION
    */

    // Icon Styling
    var plantStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'static/plant.png'
        })
    });
    var nMobStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'static/nMob.png'
        })
    });
    var pMobStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'static/pMob.png'
        })
    });
    var oStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'static/sonstige.png'
        })
    });
    var liveStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'static/lebensort.png'
        })
    });

    // WFS get features request
    var request = 'https://dservices.arcgis.com/Sf0q24s0oDKgX14j/arcgis/services/MinktStories/WFSServer?service=wfs&' +
    'version=2.0.0&request=getfeature&typeNames=MinktStories:survey&srsname=EPSG:3857&' +
    'outputFormat=GEOJSON';
    
    function httpGet(theURL){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theURL, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    // Parse as JSON
    var requestJSON = JSON.parse(httpGet(request));
    // console.log(requestJSON);
    
    var allFeatures = new ol.source.Vector();
    var mobility = new ol.source.Vector();
    var plants = new ol.source.Vector();
    var lebensort = new ol.source.Vector();
    var sonstige = new ol.source.Vector();

    // Create a layer with all features but individual styling
    for (var y in requestJSON.features) {
        var feature = requestJSON.features[y];
        var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
        var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
        });
        if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment") {
            point.setStyle(pMobStyle)
        } else if (feature.properties.Zuordnung == "Negativer_Mobilitätsmoment") {
            point.setStyle(nMobStyle)
        } else if (feature.properties.Zuordnung == "Lebensort") {
            point.setStyle(liveStyle);
        } else if (feature.properties.Zuordnung == "Heilpflanze") {
            point.setStyle(plantStyle);
        } else if (feature.properties.Zuordnung == "other") {
            point.setStyle(oStyle);
        }
        allFeatures.addFeature(point);
        point.setProperties(feature.properties);
    }

    // Distibute features in layers based on property "Zuordnung"
    for (var x in requestJSON.features) {
        var feature = requestJSON.features[x];
        var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
        //console.log(feature.geometry.coordinates);
        /* single mobility layer */
        if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment" || feature.properties.Zuordnung == "Negativer_Mobilitätsmoment") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            });
            if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment") {
                point.setStyle(pMobStyle)
            } else {
                point.setStyle(nMobStyle)
            }
            mobility.addFeature(point);
            point.setProperties(feature.properties);
        }
        if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment" || feature.properties.Zuordnung == "Negativer_Mobilitätsmoment") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            });
            if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment") {
                point.setStyle(pMobStyle)
            } else {
                point.setStyle(nMobStyle)
            }
            mobility.addFeature(point);
            point.setProperties(feature.properties);
        }else if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment" || feature.properties.Zuordnung == "Negativer_Mobilitätsmoment") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            });
            if (feature.properties.Zuordnung == "Positiver_Mobilitätsmoment") {
                point.setStyle(pMobStyle)
            } else {
                point.setStyle(nMobStyle)
            }
            mobility.addFeature(point);
            point.setProperties(feature.properties);
        }
         else if (feature.properties.Zuordnung == "Lebensort") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            }); //Feature
            point.setStyle(liveStyle);
            lebensort.addFeature(point);
            point.setProperties(feature.properties);
        } else if (feature.properties.Zuordnung == "Heilpflanze") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            });
            point.setStyle(plantStyle);
            plants.addFeature(point);
            point.setProperties(feature.properties);
        } else if (feature.properties.Zuordnung == "other") {
            var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.Feature({
            geometry: new ol.geom.Point(position)
            });
            console.log(feature.properties.Zuordnung);
            point.setStyle(oStyle);
            sonstige.addFeature(point);
            point.setProperties(feature.properties);
        }        
    }

    // Create Vector layers and set maximum resolution (relevant for feature clustering)
    var allLayer = new ol.layer.Vector({
        title: "Alle MINKT Stories",
        source: allFeatures,
        maxResolution: 40
    });

    var mobilityLayer = new ol.layer.Vector({
        title: "Mobilität",
        source: mobility,
        maxResolution: 40
    });

    var lebensortLayer = new ol.layer.Vector({
        title: "Lebensorte",
        source: lebensort,
        maxResolution: 40
    });

    var plantsLayer = new ol.layer.Vector({
        title: "Heilpflanzen",
        source: plants,
        maxResolution: 40
    });

    var otherLayer = new ol.layer.Vector({
        title: "Sonstige",
        source: sonstige,
        maxResolution: 40
    });

    /*
    FEATURE CLUSTERING 
    */ 
    
    var clusterSource = new ol.source.Cluster({
        source: allFeatures
    });
    var styleCache = {};

    // Create clustering vector Layer with styling
    var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    minResolution: 41,
    style: function(feature) {
        var size = feature.get('features').length;
        var style = styleCache[size];
        if (!style) {
            style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: '#7a6b60b3'
                    }),
                }),
                text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                })
            });
            styleCache[size] = style;
        }
        return style;
        },
    });


    /*
    GEOLOCATION
    */

    // Use geolocation to add marker at the device's location
    //add current geolocation of user 
    var geolocation = new ol.Geolocation({						
        trackingOptions: {
            enableHighAccuracy: true,
        }
    });

    var markerSource = new ol.source.Vector();

    // Once location is found ("change") draw marker, set geolocation to false, zoom to location
    geolocation.on('change', function(){			
        var currentPosition = ol.proj.transform(geolocation.getPosition(), 'EPSG:4326', 'EPSG:3857');			
        console.log(currentPosition);
        drawMarkerCurrentPosition(currentPosition);
        geolocation.setTracking(false);
        map.getView().setCenter(currentPosition);
        map.getView().setZoom(15); //if closer zoom is wanted/needed
    });

    // Create a marker for the current geolocation position  
    function drawMarkerCurrentPosition(currentPosition) {
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(currentPosition)
        });

        var vectorStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                scale: 0.5,
                src: 'static/current_position.png'
            }))
        });
        marker.setStyle(vectorStyle);
        markerSource.addFeature(marker);
    }

    // Create vector layer
    var markerLayer = new ol.layer.Vector({
        title: "Meine Position",
        visible: true,
        source: markerSource
    });

     /*
    Create Layer Groups
    */

    // To be used in the LayerSwitcher panel
    baseLayers = new ol.layer.Group({
        title: "Base Layers",
        fold:'close',
        layers: bingLayers
    });

    overlays = new ol.layer.Group({
        title: 'MINKT Stories',
        fold: "open",
        layers: [otherLayer, lebensortLayer, mobilityLayer, plantsLayer]
    });

    positioning = new ol.layer.Group({
        title: 'GPS Position',
        fold: "close",
        layers: [markerLayer]
    });


    /*
    LAYER SWITCHER
    */
    var layerSwitcher = new ol.control.LayerSwitcher({
        activationMode: "mouseover",
        tipLabel: 'Layers',
        groupSelectStyle: 'group',
        reverse: false
    });

    /*
    CREATE BASIC MAP
    */

   // Create a variable lungauPosition 
   var lungauPosition = ol.proj.transform ([13.80937, 47.12704], 'EPSG:4326', 'EPSG:3857');

    var map = new ol.Map({
        layers: [
            baseLayers,
            overlays,
            clusterLayer,
            positioning
        ],
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: true
            })
        }).extend([
            layerSwitcher,
            new ol.control.ScaleLine()
        ]),
        target: 'map',
        view: new ol.View({
            center: lungauPosition,
            zoom: 10
        })
    });

    // Geolocation button in map       
    function el(id) {
        return document.getElementById(id)
    }

    el('track').addEventListener('click', function() {
        geolocation.setTracking(this.checked);

    });


    /*
    Home Button
    */
    
    const zoomHome = document.getElementById('home');
    zoomHome.addEventListener('click', function() {
        map.getView().setCenter(lungauPosition);
        map.getView().setZoom(13);
    }, false);  

    /*
    Legend Button
    */

    const legend = document.getElementById("legend-button");
    // const legend_content = document.getElementById("legend");
    var counter = 0;
    legend.addEventListener('click', function() {
        counter++;
        console.log(counter);
        if (counter % 2 != 0) {
            document.querySelector('#legend').setAttribute("style", "display: flexbox;");
            console.log("Set to flexbox");
        } else  {
            document.querySelector('#legend').setAttribute("style", "display: none");
            console.log("Set to none");
        }
    });

    /*
    Print Button
   
    const print = document.getElementById("print");
    // const legend_content = document.getElementById("legend");
    var counter = 0;
    print.addEventListener('click', function() {
        counter++;
        console.log(counter);
        if (counter % 2 != 0) {
            document.querySelector('#print-section').setAttribute("style", "display: flexbox;");
            console.log("Set to flexbox");
        } else  {
            document.querySelector('#print-section').setAttribute("style", "display: none");
            console.log("Set to none");
        }
    });
     */
    
    /*
    ON-HOVER HIGHLIGHT
    */

    // Styles - same as for normal features but a larger scale
    var plantStyle1 = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 1.2,
            src: 'static/plant.png'
        })
    });
    var nMobStyle1 = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 1.2,
            src: 'static/nMob.png'
        })
    });
    var pMobStyle1 = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 1.2,
            src: 'static/pMob.png'
        })
    });
    var oStyle1 = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 1.2,
            src: 'static/sonstige.png'
        })
    });
    var liveStyle1 = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 1.2,
            src: 'static/lebensort.png'
        })
    });

    let selected = null;
    const status = document.getElementById('status');
    var beforeStyle;
    
    map.on('pointermove', function (e, layer) {
        if (selected !== null ) {
            // Use a variable (beforeStyle) to pass the original style back and forth!
            selected.setStyle(beforeStyle);
            selected = null;
        }
        map.forEachFeatureAtPixel(e.pixel, function (f, layer) {
            // If condition to exclude the clusterLayer and GPS positioning layer from the Style change, otherwise the "beforeStyle" is applied to the clusterLayer when zoomed out again
            if (layer !== clusterLayer && layer !== markerLayer){
            selected = f;
            f.setStyle();
            return true;
            }
          });
          
        // set new style according to each feature's Zuordnung and return beforeStyle so that it returns to whatever it was before!
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
            if (layer === allLayer || layer === plantsLayer || layer === otherLayer || layer === lebensortLayer || layer === mobilityLayer) {
                let hoverFeature = feature.get('Zuordnung')
                console.log(hoverFeature);
                
                if (hoverFeature == "Heilpflanze") {
                    selected.setStyle(plantStyle1)
                    beforeStyle = plantStyle;
                }
                if (hoverFeature == "Lebensort") {
                    selected.setStyle(liveStyle1)
                    beforeStyle = liveStyle;
                }
                if (hoverFeature == "Positiver_Mobilitätsmoment") {
                    selected.setStyle(pMobStyle1)
                    beforeStyle = pMobStyle;
                }
                if (hoverFeature == "Negativer_Mobilitätsmoment") {
                    selected.setStyle(nMobStyle1)
                    beforeStyle = nMobStyle;
                }            
                if (hoverFeature == "other") {
                    selected.setStyle(oStyle1)
                    beforeStyle = oStyle;
                }
                return beforeStyle;
            } 
        });
        //return true;
    });


    /*
     POP-UPS 
    */

    // Pop-Up for Geolocation
    const overlayContainerElementmarker = document.querySelector('.ol-popupMarker');

    const overlayLayerMarker = new ol.Overlay({
        element: overlayContainerElementmarker
    });

    map.addOverlay(overlayLayerMarker);
    overlayLayerMarker.setPosition(undefined);

    const overlayMarker = document.getElementById('marker');

    overlayMarker.innerHTML = "<p><b>DU BIST HIER</b><br>Erkunde die Karte indem du rein- und rauszoomst, auf die Elemente klickst und die Gallerie erkundest.</p>";

    geolocation.on('change', function(e){
        overlayLayerMarker.setPosition(undefined);
        var currentPosition = ol.proj.transform(geolocation.getPosition(), 'EPSG:4326', 'EPSG:3857');
        overlayLayerMarker.setPosition(currentPosition);
        map.on('click', function(e) {
            overlayLayerMarker.setPosition(undefined);
        })
    });

    // Pop-Ups for Features

    // link container to element in html
    const overlayContainerElement = document.querySelector('.ol-popup');

    // create overlay itself
    const overlayLayer = new ol.Overlay({
        element: overlayContainerElement,
        autoPan: true,
        autoPanAnimation: {
            duration: 500,
          }, 
    })
    map.addOverlay(overlayLayer);
    const overlayFeatureName = document.getElementById('feature-name');
    const overlayFeatureContent = document.getElementById('feature-content');
    const overlayFeatureCategory = document.getElementById('feature-category');
    const overlayFeatureImage = document.getElementById('feature-image');

    // On click function to read feature-at-pixel properties and fill pop-up container elements
    map.on('click', function (e) {
        overlayLayer.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
            if (layer === allLayer || layer === plantsLayer || layer === otherLayer || layer === lebensortLayer || layer === mobilityLayer) {
                let clickedCoordinate = e.coordinate;
                let clickedFeatureName = feature.get('Name_deiner_Story');
                let clickedFeatureContent = feature.get('Beschreibung');
                let clickedFeatureCategory = feature.get('Zuordnung');
                let clickedFeatureID = feature.get('ObjectID');
                overlayLayer.setPosition(clickedCoordinate);
                console.log(clickedFeatureName, clickedFeatureContent, clickedFeatureCategory);
                overlayFeatureName.innerHTML = "<h3>" + clickedFeatureName + "</h3>";
                overlayFeatureContent.innerHTML = "<p>" + clickedFeatureContent + "</p>";
                overlayFeatureCategory.innerHTML = "<p><i>Kategorie: "+ clickedFeatureCategory + "</i></p>";
                // Create image URL dynamically with the ObjectID 
                overlayFeatureImage.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
                clickedFeatureID + "/attachments/" + clickedFeatureID + token +
                " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);'>";
            }
        }) 
    });

    // Pop Up for Gallery PopUps (No AutoPan! Otherwise map.zoom and setView gets messed up)
       // link container to element in html
       const overlayContainerElement1 = document.querySelector('.ol-popup');

       // create overlay itself
       const overlayLayer1 = new ol.Overlay({
           element: overlayContainerElement1 
       })
       map.addOverlay(overlayLayer1);
       const overlayFeatureName1 = document.getElementById('feature-name');
       const overlayFeatureContent1 = document.getElementById('feature-content');
       const overlayFeatureCategory1 = document.getElementById('feature-category');
       const overlayFeatureImage1 = document.getElementById('feature-image');

        // On click function to read feature-at-pixel properties and fill pop-up container elements
        map.on('click', function (e) {
             overlayLayer1.setPosition(undefined); 
             map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
                if (layer === allLayer || layer === plantsLayer || layer === otherLayer || layer === lebensortLayer || layer === mobilityLayer) {
                    let clickedCoordinate = e.coordinate;
                    let clickedFeatureName = feature.get('Name_deiner_Story');
                    let clickedFeatureContent = feature.get('Beschreibung');
                    let clickedFeatureCategory = feature.get('Zuordnung');
                    let clickedFeatureID = feature.get('ObjectID');
                    overlayLayer1.setPosition(clickedCoordinate);
                    console.log(clickedFeatureName, clickedFeatureContent, clickedFeatureCategory);
                    overlayFeatureName1.innerHTML = "<h3>" + clickedFeatureName + "</h3>";
                    overlayFeatureContent1.innerHTML = "<p>" + clickedFeatureContent + "</p>";
                    overlayFeatureCategory1.innerHTML = "<p><i>Kategorie: "+ clickedFeatureCategory + "</i></p>";
                   // Create image URL dynamically with the ObjectID 
                    overlayFeatureImage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
                    clickedFeatureID + "/attachments/" + clickedFeatureID + token +
                    " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);'>";
                }
           })
        });


    /*
    IMAGE GALLERY
    */

    // Images in Gallery
    const galleryimage1 = document.getElementById('gallery-image1');
    const galleryimage2 = document.getElementById('gallery-image2');
    const galleryimage3 = document.getElementById('gallery-image3');
    const galleryimage4 = document.getElementById('gallery-image4');

    // Hover text in Gallery
    const gallerytext1 = document.getElementById('image1-text');
    const gallerytext2 = document.getElementById('image2-text');
    const gallerytext3 = document.getElementById('image3-text');
    const gallerytext4 = document.getElementById('image4-text');

    // Get ObjectID for image URL
    var featuresID = [];
    for (var u in requestJSON.features) {
        featuresID[u] = requestJSON.features[u].properties.ObjectID;
    };

    // Get Story name for hover text
    var featuresText = [];
    for (var v in requestJSON.features) {
        featuresText[v] = requestJSON.features[v].properties.Name_deiner_Story;
    }; 
    
    // Variable to set imageIndex (determines which images are shown)
    // Initial value defaults to the middle of the array, so users can click prev. and next
    var length = requestJSON.features.length;
    // Apply Math.round to the initial index number - otherwise we might get a decimal number!
    var imageIndex = Math.round((length - (length / 2)));

    // Fill Gallery with initial images uning URL frame and imageIndex
    galleryimage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex] + "/attachments/" + featuresID[imageIndex] + token +
    " width='300' >";
    galleryimage2.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 1] + "/attachments/" + featuresID[imageIndex + 1] + token +
    " width='300' >";
    galleryimage3.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 2] + "/attachments/" + featuresID[imageIndex + 2] + token +
    " width='300' >";
    galleryimage4.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 3] + "/attachments/" + featuresID[imageIndex + 3] + token +
    " width='300' >";

    // Fill Gallery with text corresponding to images 
    gallerytext1.innerHTML = "<p>" + featuresText[imageIndex] + "</p>";
    gallerytext2.innerHTML = "<p>" + featuresText[imageIndex + 1] + "</p>";
    gallerytext3.innerHTML = "<p>" + featuresText[imageIndex + 2] + "</p>";
    gallerytext4.innerHTML = "<p>" + featuresText[imageIndex + 3] + "</p>";
    
    // initate next and previous controls to change image gallery 
    init.changeIndex = function changeIndex(n) {
        // Add "If" conditions to prevent the user from clicking out of bounds of the existing image index range
        if(imageIndex === 0 && n === -1){
            // don't do anything
        }
        else if(imageIndex + 3 === length - 1 && n === 1) {
            // don't do anything
        }
        else {
            imageIndex = imageIndex + n;

            // Fill Gallery with Images
            galleryimage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex] + "/attachments/" + featuresID[imageIndex] + token +
            " width='300'>";
            galleryimage2.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 1] + "/attachments/" + featuresID[imageIndex + 1] + token +
            " width='300'>";
            galleryimage3.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 2] + "/attachments/" + featuresID[imageIndex + 2] + token +
            " width='300'>";
            galleryimage4.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 3] + "/attachments/" + featuresID[imageIndex + 3] + token +
            " width='300'>";

            // Fill Gallery with Text
            gallerytext1.innerHTML = "<p>" + featuresText[imageIndex] + "</p>";
            gallerytext2.innerHTML = "<p>" + featuresText[imageIndex + 1] + "</p>";
            gallerytext3.innerHTML = "<p>" + featuresText[imageIndex + 2] + "</p>";
            gallerytext4.innerHTML = "<p>" + featuresText[imageIndex + 3] + "</p>";

            return imageIndex;
        }
        return imageIndex;
    }

    // Add Event listener on media blocks for zoom and center function in map
    const media1 = document.getElementById('media1');

    media1.addEventListener('click', function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex].geometry.coordinates[0], requestJSON.features[imageIndex].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(16);
          // Pop-Up
          overlayLayer1.setPosition(zoomPosition);
          console.log(zoomPosition);
          overlayFeatureName1.innerHTML = "<h3>" + requestJSON.features[imageIndex].properties.Name_deiner_Story + "</h3>";
          overlayFeatureContent1.innerHTML = "<p>" + requestJSON.features[imageIndex].properties.Beschreibung + "</p>";
          overlayFeatureCategory1.innerHTML = "<p><i>Kategorie: "+ requestJSON.features[imageIndex].properties.Zuordnung + "</i></p>";
          // Create image URL dynamically with the ObjectID 
          overlayFeatureImage.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
          (imageIndex + 1) + "/attachments/" + (imageIndex + 1) + token +
          " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);'>";
        })

    const media2 = document.getElementById('media2');
    media2.addEventListener('click', function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 1].geometry.coordinates[0], requestJSON.features[imageIndex + 1].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(16);
         // Pop-Up
         overlayLayer1.setPosition(zoomPosition);
         overlayFeatureName1.innerHTML = "<h3>" + requestJSON.features[imageIndex + 1].properties.Name_deiner_Story + "</h3>";
         overlayFeatureContent1.innerHTML = "<p>" + requestJSON.features[imageIndex + 1].properties.Beschreibung + "</p>";
         overlayFeatureCategory1.innerHTML = "<p><i>Kategorie: "+ requestJSON.features[imageIndex + 1].properties.Zuordnung + "</i></p>";
         // Create image URL dynamically with the ObjectID 
         overlayFeatureImage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
         (imageIndex + 2) + "/attachments/" + (imageIndex + 2) + token +
         " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);' >";
        })

    const media3 = document.getElementById('media3');
    media3.addEventListener('click', function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 2].geometry.coordinates[0], requestJSON.features[imageIndex + 2].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(16);
         // Pop-Up
         overlayLayer1.setPosition(zoomPosition);
        overlayFeatureName1.innerHTML = "<h3>" + requestJSON.features[imageIndex + 2].properties.Name_deiner_Story + "</h3>";
        overlayFeatureContent1.innerHTML = "<p>" + requestJSON.features[imageIndex + 2].properties.Beschreibung + "</p>";
        overlayFeatureCategory1.innerHTML = "<p><i>Kategorie: "+ requestJSON.features[imageIndex + 2].properties.Zuordnung + "</i></p>";
        // Create image URL dynamically with the ObjectID 
        overlayFeatureImage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
        (imageIndex + 3) + "/attachments/" + (imageIndex + 3) + token +
        " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);' >";
        })

    const media4 = document.getElementById('media4');
    media4.addEventListener('click', function () {
        var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 3].geometry.coordinates[0], requestJSON.features[imageIndex + 3].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');            
        map.getView().setCenter(zoomPosition);
        map.getView().setZoom(16);
        // Pop-Up
        overlayLayer1.setPosition(zoomPosition);
        overlayFeatureName1.innerHTML = "<h3>" + requestJSON.features[imageIndex + 3].properties.Name_deiner_Story + "</h3>";
        overlayFeatureContent1.innerHTML = "<p>" + requestJSON.features[imageIndex + 3].properties.Beschreibung + "</p>";
        overlayFeatureCategory1.innerHTML = "<p><i>Kategorie: "+ requestJSON.features[imageIndex + 3].properties.Zuordnung + "</i></p>";
        // Create image URL dynamically with the ObjectID 
        overlayFeatureImage1.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
        (imageIndex + 4) + "/attachments/" + (imageIndex + 4) + token +
        " height='200px' style = 'box-shadow: 0px 0px 5px rgba(83, 83, 83, 0.544);' >";
        })


/* Print PDF Option */


    const dims = {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148],
    };
  
  const exportButton = document.getElementById('export-pdf');
  
  exportButton.addEventListener(
    'click',
    function () {
      exportButton.disabled = true;
      document.body.style.cursor = 'progress';
  
      const format = document.getElementById('format').value;
      const resolution = document.getElementById('resolution').value;
      const dim = dims[format];
      const width = Math.round((dim[0] * resolution) / 25.4);
      const height = Math.round((dim[1] * resolution) / 25.4);
      const size = map.getSize();
      const viewResolution = map.getView().getResolution();
  
      map.once('rendercomplete', function () {
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              const transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              const matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        const pdf = new jspdf.jsPDF('landscape', undefined, format);
        pdf.addImage(
          mapCanvas.toDataURL('image/jpeg'),
          'JPEG',
          0,
          0,
          dim[0],
          dim[1]
        );
        pdf.save('map.pdf');
        // Reset original map size
        map.setSize(size);
        map.getView().setResolution(viewResolution);
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
      });
  
      // Set print size
      const printSize = [width, height];
      map.setSize(printSize);
      const scaling = Math.min(width / size[0], height / size[1]);
      map.getView().setResolution(viewResolution / scaling);
    },
    false
    );
};
