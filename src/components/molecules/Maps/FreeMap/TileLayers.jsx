
const OpenStreetMap = {
    url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

const OpenMapSurfer_Roads = { 
    url:'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png', 
	maxZoom: 19,
	attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

const Stadia_OSMBright = { 
    url:'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', 
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
};

const OpenTopoMap = {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
};

const Esri_WorldStreetMap = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', 
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
};

const Esri_WorldImagery = {
    url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
};

const DEFAULT_ATTRIBUTION = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | ';

/* source: https://github.com/leaflet-extras/leaflet-providers  and http://leaflet-extras.github.io/leaflet-providers/preview/index.html */
const AvailableLayers = [ 

    { name:'OpenStreetMap', config: OpenStreetMap },
    { name:'OpenMapSurfer', config: OpenMapSurfer_Roads },
    { name:'Stadia', config:Stadia_OSMBright},
    { name:'OpenTopoMap', config:OpenTopoMap },
    { name:'Esri Street',config: Esri_WorldStreetMap },
    { name:'Esri Satelite',config: Esri_WorldImagery}
]

export default class TileLayers {
    static get(name) {
        let layer =  AvailableLayers.find((el)=>el.name===name);
        if ( layer!==undefined)  {
            layer.attribution = DEFAULT_ATTRIBUTION + layer.attribution;
            return layer.config;
        }
    }
}