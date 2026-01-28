import React from "react";
import {EventLogger} from 'gd-eventlog'
import { useNavigate } from "react-router";


export const Back = ()=> {
    const navigate = useNavigate()

    navigate(-1)

    return <></>
}

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: undefined};
        this.logger = new EventLogger('Incyclist')
    }
    static getDerivedStateFromError(err) {
        // Update state so the next render will show the fallback UI.
        return {error:err};
      }
    
    componentDidCatch(err) {
        if (this.props.debug)
            console.log ('# error in component', err)    
        
        let component
        if ( !Array.isArray(this.props.children) ) {
            const child = this.props.children
            component = child?.type?.name
        }
        this.logger.logEvent({message:'error in component', component, error:err.message, stack:err.stack})
    }
  
    render() {
      
        if (this.state.error) {
            if (this.props.hideOnError)
                return null

            if (this.props.history)
                return <Back/>
          
          window.alert(this.state.error.message ?? this.state.error)
          return null
      }
      return this.props.children
    }
}