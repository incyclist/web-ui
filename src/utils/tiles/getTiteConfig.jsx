import { hasFeature } from "..";
import TileLayers from "./TileLayers";


export const getTiteConfig = () => {
    if (hasFeature('network.openmap-referrer'))
        return TileLayers.get('OpenStreetMap');

    else
        return TileLayers.get('Carto');
};
