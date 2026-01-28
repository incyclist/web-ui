import NodePath from 'path'
import {parse} from 'react-native-path'

import { api, hasFeature, isElectron,isReactNative } from '../../utils';

export class PathBinding  { // implements IPathBinding

    static _instance 
    static getInstance() {
        if (!PathBinding._instance)
            PathBinding._instance = new PathBinding()
        return PathBinding._instance
    }

    getBinding() {
        if (this.binding) {
            return this.binding
        }
        
        if (isElectron() && hasFeature('fileSystem')) {
            this.binding = api.path;
        }        
        else if (isReactNative() || window) { // Mobile, legacy or Web
            const join = (...args) => {
                // Split the inputs into a list of path commands.
                let parts = [];
                for (let i = 0, l = args.length; i < l; i++) {
                    parts = parts.concat(args[i].split("/"));
                }
                // Interpret the path commands to get the new resolved path.
                let newParts = [];
                for (let i = 0, l = parts.length; i < l; i++) {
                    let part = parts[i];
                    // Remove leading and trailing slashes
                    // Also remove "." segments
                    if (!part || part === ".") continue;
                    // Interpret ".." to pop the last segment
                    if (part === "..") newParts.pop();
                    // Push new path segments.
                    else newParts.push(part);
                }
                // Preserve the initial slash if there was one.
                if (parts[0] === "") newParts.unshift("");
                // Turn back into a single string path.
                return newParts.join("/") || (newParts.length ? "/" : ".");                
            }

            this.binding = {parse,join}
        }
        else  {            
            this.binding = NodePath;
        }
        return this.binding
    
    }

    parse(path) {
        return this.getBinding().parse(path)
    }

    join(...paths) {
        return this.getBinding().join(...paths)
    }

    
}

export const usePath = ()=> { return PathBinding.getInstance()}