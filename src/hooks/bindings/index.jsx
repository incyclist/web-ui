import {useIncyclist} from 'incyclist-services'
import { initBindings } from '../../bindings/factory'

export const useBindings = ()=> { 
    const service = useIncyclist()
    const bindings = initBindings()
    service.setBindings(bindings)
}