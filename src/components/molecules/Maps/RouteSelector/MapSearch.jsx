import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";
import { MarkerIcon } from "./MarkerIcon";

export const MapSearch = ( {onSearchResult}) => {

  const refInitialized = useRef(false)
  const refQuery = useRef(undefined)
  const map = useMapEvents( {
        'geosearch/showlocation': (data)=> {
            if (onSearchResult)  {

                const {location={}} = data??{}
                const lat = location.y;
                const lng = location.x
                const address = location.raw?.display_name
                onSearchResult({lat,lng,address,query:refQuery.current})
            }
        }
  });

  useEffect(() => {
    if (refInitialized.current)
        return

    class MyOpenStreetMapProvider extends OpenStreetMapProvider {
        search(args) {
            refQuery.current = args?.query;
            return super.search(args)
        }
    }


    const provider = new MyOpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
        provider,
        marker: {
            icon:MarkerIcon
        },
        maxSuggestions: 10,
        autoClose: true,
        updateMap:true,
    });


    map.addControl(searchControl);
    refInitialized.current = true

    return () => {
        refInitialized.current = false
        map.removeControl(searchControl)
    };
  }, [map]);

  return null;
}

