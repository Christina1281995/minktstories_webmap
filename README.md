![Capture](https://user-images.githubusercontent.com/81073205/152940824-5ef1258c-252a-4812-8d9d-db597b0784ee.PNG)
## MINKT Stories Web Map

The MINKT Stories web map hosted here is the central element of a map-based platform with which the [iDEAS:lab](https://ideaslab.plus.ac.at/) in Salzburg, Austria hosts workshops to **build digial skills with young citizen scientists**.

The web map is an open layers web application that integrates data collected in Survey123 as a WFS. The application includes pop-ups, geolocation, an interactive gallery, and layer switchers ([walkermatt-layerswitcher](https://github.com/walkermatt/ol-layerswitcher)).

**See the Web Map Result:** <br/>
[https://zgis.github.io/minktstories_webmap/](https://zgis.github.io/minktstories_webmap/)

**View the MINKT Stories Platform:** <br/>
[https://minkt-stories-lungau.zgis.at/](https://minkt-stories-lungau.zgis.at/)

<br/>

![image](https://user-images.githubusercontent.com/81073205/143590945-9ffa7b3e-0f4c-4597-8e14-29defc484a87.png)

<br/>
<br/>


## The Concept and Spatial Data Infrastructure behind the Web Map
<br/>

![concept](https://user-images.githubusercontent.com/81073205/152963923-d81558b9-1af7-4f17-b943-cc972a8176af.png)

<br/>
<br/>

## Recent Updates

<br/>

| _Date_  | Issue / Edit |
| ------------- | ------------- |
| _21.12.2021_  | **ol.proj.transform()**: The features from the WFS no longer showed up on the map today. Upon investigation it turns out the coordinates of each point was being coverted completely wrong (some points had invalid coordinates, some were in Canada, and some were in Antarctica). Only after removing the ol.proj.transform function from the point geometries wsa the issue resolved and the points again appear in their correct location. Oddly, the geolocation and the home position still function properly with the transformation function. Note: no changes were made to the survey, the WFS, or the source code of this web map when I noticed the missing features.  | 
| _07.12.2021_  | Legend updated with improved icons and css styling. |
| _01.12.2021_  | Legend added. Some stylistic improvements. |
|  _30.11.2021_  | Added to the map: autoPan function for the pop-ups, on-hover highlighting of the individual features, and an on-hover opening and closing of the layer switcher menu were added.  |

<br/>
<br/>

**Contributors:** <br/>
Niklas Jaggy, Katharina Wöhs, Christina Zorenböhmer


<br/>

**Create a New MINKT Story yourself:** <br/>
Go to [Survey123](https://survey123.arcgis.com/share/b6e023860648421f832ce0e93ad14aec) and simply upload a new story. <br/>
<img align="center" src="https://user-images.githubusercontent.com/81073205/144023964-5ae8c0b1-2d0c-480d-9278-e644319403a5.png" width="200" height="200">
