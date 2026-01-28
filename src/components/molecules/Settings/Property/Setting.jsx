import React from 'react';
import {EventLogger} from 'gd-eventlog'
import {CyclingModeProperyType} from 'incyclist-services'

const DEFAULT_UPDATE_TIMEOUT = 5000

export class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            error: false,
        }
        this.logger = props.logger || new EventLogger('Setting');
    }

    componentDidUpdate(prevProps, prevState) { 
        
        if (this.props.value!==prevProps.value) {
            this.setState({value:this.props.value})
        }
    }

    

    onIntegerChange(property, value, confirmed) {
        const {min,max,updateTimeout=DEFAULT_UPDATE_TIMEOUT} = property;
        
        const validate = (value) => {
            const size = max ? Math.floor(Math.log10(max))+1 : 5;
            const regex = new RegExp(`^[0-9]{1,${size}}$`);
            
            if (value==='' || value===undefined || value===null) return true;
            return regex.test(value)            
        }

        const checkRange = (value) => { 
            if (min!==undefined && value < min) return false;
            return  (max===undefined || value <= max)             
        }

        const onConfirmed = () => {
            if (!this.props.noLog)
                this.logger.logEvent( {message: 'text entered',field:property.key,value:this.state.value, eventSource:'user' })
            clearInterval(this.ivFinishTypingCheck)
            this.ivFinishTypingCheck = undefined;
                            
            const {onChange} = this.props;               
            const rangeValidated = checkRange(this.state.value);

            const validated = this.props.validate ? this.props.validate(this.state.value) : true;
            if (!rangeValidated || validated!==true) {
                this.setState({error:true})
                return;
            }
            if (rangeValidated && validated===true && this.state.error) {
                this.setState({error:false})
            }
            if ( onChange && typeof (onChange) === 'function')
                onChange(property.key,this.state.value)
                

        }

        this.lastUpdate = Date.now();
        const validated = validate(value)
        if (!validated)        
            return;

        if (confirmed) {
            if (this.ivFinishTypingCheck) {
                clearInterval(this.ivFinishTypingCheck)
                this.ivFinishTypingCheck = undefined;
            }
            onConfirmed()
        }
    
        else if (!this.ivFinishTypingCheck) {
            this.ivFinishTypingCheck = setInterval(() => {
                if ( (this.lastUpdate + updateTimeout) < Date.now()) {
                    onConfirmed();
                }
            }, 100);
        }

        this.setState({value})                        
    }

    onTextChange(property, value,confirmed) {
        const {regex,validation,updateTimeout=DEFAULT_UPDATE_TIMEOUT} = property;
        

        const validate = (value) => {
            if (value==='' || value===undefined || value===null || !regex) return true;
            
            const r = new RegExp(regex);            
            return r.test(value)            
        }


        const onConfirmed = () => {
            if (!this.props.noLog) {
                const value = this.props?.property?.type === 'password' ? '****' : this.state.value
                this.logger.logEvent( {message: 'text entered',field:property.key,value, eventSource:'user' })
            }
            clearInterval(this.ivFinishTypingCheck)
            this.ivFinishTypingCheck = undefined;
                            
            const {onChange} = this.props;               
            const validated = validation ? validation(this.state.value) : true;
            if (validated!==true) {
                this.setState({error:true})
                return;
            }
            if (validated===true && this.state.error) {
                this.setState({error:false})
            }
            if ( onChange && typeof (onChange) === 'function')
                onChange(property.key,this.state.value  )
            

        }

        this.lastUpdate = Date.now();
        const validated = validate(value)
        if (!validated)        
            return;

        if (confirmed) {
            if (this.ivFinishTypingCheck) {
                clearInterval(this.ivFinishTypingCheck)
                this.ivFinishTypingCheck = undefined;
            }
            onConfirmed()
        }

        else if (!this.ivFinishTypingCheck) {
            this.ivFinishTypingCheck = setInterval(() => {
                if ( (this.lastUpdate + updateTimeout) < Date.now()) {
                    onConfirmed();
                }
            }, 100);
        }

        this.setState({value})                        
    }

    onBooleanChange(property, value,confirmed) {
        if (!this.props.noLog)
            this.logger.logEvent( {message: 'checkbox clicked',checkbox:property.key,checked:value, eventSource:'user'})
        const {onChange} = this.props;
        this.setState({value},()=>{
            if ( onChange && typeof (onChange) === 'function')
                onChange(property.key,value)
        })
    }


    render() {
        const {property, settings, onChange,disabled=false} = this.props;
        const {value,error} = this.state;
        if (property.condition && property.condition(settings)===false) 
            return null;

        let size = property.size
        if (property.type===CyclingModeProperyType.Integer && property.max)  {
            size = Math.floor(Math.log10(property.max))+1
        }

        switch (property.type) {
            case CyclingModeProperyType.SingleSelect:
                return (
                    <select value={value} disabled={disabled} onChange={(e)=>onChange(property.key, e.target.value)}>
                        {property.options.map((option, index) => <option key={option?.key??option} value={option?.key??option}>{option?.display??option}</option>)}
                    </select>
                );    
            case CyclingModeProperyType.Boolean:
                return (
                    <input type="checkbox" disabled={disabled} checked={value} onChange={(e)=>this.onBooleanChange(property, e.target.checked)}/>
                )
            case CyclingModeProperyType.Integer:
                return (
                    <input style={{ color: error? 'red' : 'black' }}type="text" disabled={disabled} size={size} value={value} onBlur={ (e)=>this.onIntegerChange(property, e.target.value, true) } onChange={(e)=>this.onIntegerChange(property, e.target.value)}/>
                )
            case CyclingModeProperyType.String:
                
                return (
                    <input style={{ color: error? 'red' : 'black' }}type="text" disabled={disabled} size={size} value={value} onBlur={ (e)=>this.onTextChange(property, e.target.value, true) } onChange={(e)=>this.onTextChange(property, e.target.value)}/>
                )
            case 'password':
                
                return (
                    <input style={{ color: error? 'red' : 'black' }} type="password" disabled={disabled} size={size} value={value} onBlur={ (e)=>this.onTextChange(property, e.target.value, true) } onChange={(e)=>this.onTextChange(property, e.target.value)}/>
                )
            default:
            return value;
        }
    }
}
