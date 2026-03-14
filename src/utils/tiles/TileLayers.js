
const OpenStreetMap = {
    url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

const Stadia_OSMBright = { 
    url:'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', 
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
};


const Esri_WorldStreetMap = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', 
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
};

const Esri_WorldImagery = {
    url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
};

const Carto_Voyager = {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};
const DEFAULT_ATTRIBUTION = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | ';

/* source: https://github.com/leaflet-extras/leaflet-providers  and http://leaflet-extras.github.io/leaflet-providers/preview/index.html */
const AvailableLayers = [ 

    { name:'OpenStreetMap', config: OpenStreetMap },
    { name:'Stadia', config:Stadia_OSMBright},
    { name:'Esri Street',config: Esri_WorldStreetMap },
    { name:'Esri Satelite',config: Esri_WorldImagery},
    { name:'Carto',config:Carto_Voyager}
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

