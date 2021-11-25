function init () {
   
    /*
    BASE LAYERS
    */

    var styles = ['Road', 'Aerial','AerialWithLabels'];
    var bingKey = 'ApTJzdkyN1DdFKkRAE6QIDtzihNaf6IWJsT-nQ_2eMoO4PN__0Tzhl2-WgJtXFSp';

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

    //combining base layers in array for layer switcher
    bingLayers.push(osm);

    /*
    WFS INTEGRATION
    */

    var plantStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'plant.png'
        })
    });
    var nMobStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'nMob.png'
        })
    });
    var pMobStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'pMob.png'
        })
    });
    var oStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'sonstige.png'
        })
    });
    var liveStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.85,
            src: 'lebensort.png'
        })
    });

    var request = 'https://dservices.arcgis.com/Sf0q24s0oDKgX14j/arcgis/services/MinktStories/WFSServer?service=wfs&' +
    'version=2.0.0&request=getfeature&typeNames=MinktStories:survey&srsname=EPSG:3857&' +
    'outputFormat=GEOJSON';
    
    function httpGet(theURL){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theURL, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }
    var requestJSON = JSON.parse(httpGet(request));

    console.log(requestJSON);
    
    var allFeatures = new ol.source.Vector();
    var mobility = new ol.source.Vector();
    var plants = new ol.source.Vector();
    var lebensort = new ol.source.Vector();
    var sonstige = new ol.source.Vector();

    //create layer with all features but individual styling
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
    }//for loop

    //distibute features in layers based on feature "Zuordnung"
    for (var x in requestJSON.features) {
        var feature = requestJSON.features[x];
        var position = ol.proj.transform([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
        //console.log(feature.geometry.coordinates);
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
            
        } else if (feature.properties.Zuordnung == "Lebensort") {
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
        
        }//else if         
    }//for loop

    var allLayer = new ol.layer.Vector({
        title: "Alle Kategorien",
        source: allFeatures,
        maxResolution: 30
    });

    var mobilityLayer = new ol.layer.Vector({
        title: "Mobilität",
        source: mobility,
        maxResolution: 30
    });

    var lebensortLayer = new ol.layer.Vector({
        title: "Lebensorte",
        source: lebensort,
        maxResolution: 30
    });

    var plantsLayer = new ol.layer.Vector({
        title: "Heilpflanzen",
        source: plants,
        maxResolution: 30
    });

    var otherLayer = new ol.layer.Vector({
        title: "Sonstige",
        source: sonstige,
        maxResolution: 30
    });
    
    /*
    Create Layer Groups
    */

    baseLayers = new ol.layer.Group({
        title: "Base Layers",
        fold:'open',
        layers: bingLayers
    });

    overlays = new ol.layer.Group({
        title: 'MINKT Stories',
        fold: "open",
        layers: [otherLayer, lebensortLayer, mobilityLayer, plantsLayer, allLayer]
    });


    /*
    LAYER SWITCHER
    */
    var layerSwitcher = new ol.control.LayerSwitcher({
        activationMode: "click",
        tipLabel: 'Layers', // Optional label for button
        groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
    });

    //create an object lungauPosition 
    var lungauPosition = ol.proj.transform ([13.80937, 47.12704], 'EPSG:4326', 'EPSG:3857');

    /*
    FEATURE CLUSTERING 
    */ 

    var clusterSource = new ol.source.Cluster({
        source: allFeatures
    });
    var styleCache = {};

    // Clustering Layer
    var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    minResolution: 31,
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

    //use geolocation to add marker to computers location
    //add current geolocation of user 
    var geolocation = new ol.Geolocation({						
        trackingOptions: {
            enableHighAccuracy: true,
        }
    });

    var markerSource = new ol.source.Vector();

    geolocation.on('change', function(){
        						
        var currentPosition = ol.proj.transform(geolocation.getPosition(), 'EPSG:4326', 'EPSG:3857');			
        console.log(currentPosition);
        drawMarkerCurrentPosition(currentPosition);
        geolocation.setTracking(false);
        map.getView().setCenter(currentPosition);
        //map.getView().setZoom(15); //if closer zoom is wanted/needed
    });

    //create a marker for the current geolocation position  
    function drawMarkerCurrentPosition(currentPosition) {
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(currentPosition)
        });

        var vectorStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                scale: 0.5,
                src: 'current_position.png'
            }))
        });
        marker.setStyle(vectorStyle);
        markerSource.addFeature(marker);
    }//drawMarkerCurrentPosition

    var markerLayer = new ol.layer.Vector({
        title: "Markers",
        source: markerSource
    });
    

    /*
    CREATE BASIC MAP
    */

    var map = new ol.Map({
        layers: [
            baseLayers,
            overlays,
            clusterLayer,
            markerLayer
        ],
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }).extend([
            layerSwitcher,
            new ol.control.ScaleLine()
        ]),
        // set map centre to lungauPosition
        target: 'map',
        view: new ol.View({
            center: lungauPosition,
            zoom: 10
        })
    });

        
    function el(id) {
        return document.getElementById(id)
    }

    el('track').addEventListener('click', function() {
        geolocation.setTracking(this.checked);

    });


    /*
    ICON STYLE CHANGE ON HOVER
    */

    let selected = null;

    map.on('click', function (e) {
        if (selected !== null) {
          selected.setStyle(undefined);
          selected = null;
        }
        map.forEachFeatureAtPixel(e.pixel, function (f) {
            //selected = f
            console.log(feature.properties.Zuordnung);

            if (feature.properties.Zuordnung === "Heilpflanze") {
                //feature.setStyle(plantStyle_hover);        
            }
        });
    })


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
        //overlayLayerMarker.setPosition(undefined);
        var currentPosition = ol.proj.transform(geolocation.getPosition(), 'EPSG:4326', 'EPSG:3857');
        overlayLayerMarker.setPosition(currentPosition);
    });

    // Pop-Ups for Features

    // link container to element in html
    const overlayContainerElement = document.querySelector('.ol-popup');

    // create overlay itself
    const overlayLayer = new ol.Overlay({
        element: overlayContainerElement
    })
    map.addOverlay(overlayLayer);
    const overlayFeatureName = document.getElementById('feature-name');
    const overlayFeatureContent = document.getElementById('feature-content');
    const overlayFeatureCategory = document.getElementById('feature-category');
    const overlayFeatureImage = document.getElementById('feature-image');

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
                clickedFeatureID + "/attachments/" + clickedFeatureID + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
                " height='200px' >";
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
    featuresID[imageIndex] + "/attachments/" + featuresID[imageIndex] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
    " >";
    galleryimage2.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 1] + "/attachments/" + featuresID[imageIndex + 1] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
    " >";
    galleryimage3.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 2] + "/attachments/" + featuresID[imageIndex + 2] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
    " >";
    galleryimage4.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
    featuresID[imageIndex + 3] + "/attachments/" + featuresID[imageIndex + 3] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
    " >";

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
            featuresID[imageIndex] + "/attachments/" + featuresID[imageIndex] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
            " >";
            galleryimage2.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 1] + "/attachments/" + featuresID[imageIndex + 1] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
            " >";
            galleryimage3.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 2] + "/attachments/" + featuresID[imageIndex + 2] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
            " >";
            galleryimage4.innerHTML = "<img src='https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/survey123_b6e023860648421f832ce0e93ad14aec/FeatureServer/0/" +
            featuresID[imageIndex + 3] + "/attachments/" + featuresID[imageIndex + 3] + "?token=ehnLSS8QylmvaSoPcx3fdX_KMUxJjeYJZk3tHGZ1Qf_mbxnA2QqAsUjdkbQaOFLK2TpnNm0sTJ4GkZYhn96GHzu6emPYUn81cBtaSK3RHcsN9aA-AdRNv02LFZvCr2KcDx2yK4qLrf5SDvTjRvLjT9brc8AJl6mBYl20NLB5-StLb7Nfuw93J8xmjzPb8VWPMspFiQGMUg0qE1V05048aXpLrxQGLSz4YSQD1TzjsMA_-rhzOBVEGbGPpjmNOpim' " +
            " >";

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
    media1.addEventListener(
        'click',
        function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex].geometry.coordinates[0], requestJSON.features[imageIndex].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(15);
        })
    const media2 = document.getElementById('media2');
    media2.addEventListener(
        'click',
        function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 1].geometry.coordinates[0], requestJSON.features[imageIndex + 1].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(15);
        })
    const media3 = document.getElementById('media3');
    media3.addEventListener(
        'click',
        function () {
         var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 2].geometry.coordinates[0], requestJSON.features[imageIndex + 2].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');
         map.getView().setCenter(zoomPosition);
         map.getView().setZoom(15);
        })
    const media4 = document.getElementById('media4');
    media4.addEventListener(
        'click',
        function () {
            var zoomPosition = ol.proj.transform([requestJSON.features[imageIndex + 3].geometry.coordinates[0], requestJSON.features[imageIndex + 3].geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857');            
            map.getView().setCenter(zoomPosition);
            map.getView().setZoom(15);
        })
}
