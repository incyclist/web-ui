import React from 'react';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader'
import ClipLoader from 'react-spinners/ClipLoader'
import { useDeviceAccess } from 'incyclist-services';
import { sleep } from '../../../../utils/coding';
import { Column, Row } from '../../../atoms';


const ImgWhite = styled.img`
    max-width:100%;
    fill: ${props => props.fill || 'white'};
    max-height:100%;
    filter: brightness(0) invert(1);
    x:invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
`;


const TextBlock = styled.div`
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 25.5vv;
    color: ${props => props.color || 'white'};
`;

const Btn = styled.button`
    border-color: #2c3e50;
    position: relative;
    float: left;
    fled-direction: column;
    margin-bottom: 0;
    mergin-left: auto;
    mergin-right: auto;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    border: 1px solid transparent;
    white-space: nowrap;
    padding: 0;
    width: ${props => props.width || props.size};
    height: ${props => props.height || props.size};
    font-size: 1.1vh;
    border-radius: 4px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin:0;
    margin-top: 1.1vh;

`;    


const Texts = {
    serial: 'Serial',
    ant: 'Ant+',
    ble: 'BLE',
    tcpip: 'TCP',
    wifi:  'Wifi'
}

const Icons = {
    ant: 'images/ant.svg',
    serial: 'images/usb.svg',
    tcpip: 'images/tcpip.svg',
    ble: 'images/ble.svg',
    wifi: 'images/wifi.svg',

}


export default class InterfaceInfoWrapper  extends React.PureComponent{

    constructor (props) {
        super(props);

        this.state = {
            ifState: 'unknown',
            scanState: props.scanState,
        }
        this.prevColor = undefined
        this.deviceAccess = null;

        this.interfaceChangedHandler = this.onInterfaceChanged.bind(this)
        this.scanStateChangeHandler = this.onScanStateChanged.bind(this)
    }

    initServices() {
        const {name,connectRetry} = this.props;

        if (!this.deviceAccess) {
            this.deviceAccess = useDeviceAccess()
        
            // Device Access Service Events
            this.deviceAccess.on('interface-changed',this.interfaceChangedHandler)        
            this.deviceAccess.on('scanstate-changed',this.scanStateChangeHandler)        
            
        }

        const info = this.deviceAccess?.getInterfaceInfo(name)   
        
        if (info) {
            if (info.state!=='connected' && connectRetry)
                this.iv = setInterval(() => { this.autoConnect() }, 2000);
            
            this.setState({ifState:info.state} )            
        }
        else {
            this.setState({ifState:'unavailable'} )            
        }
        
        
    }

    componentDidMount() {
        this.initServices()

        if (this.state && !this.iv) {
            this.initServices()
        }

    }

    componentWillUnmount() {
        if (this.iv) {
            clearInterval(this.iv)
            this.iv = null;
        }
        this.deviceAccess.off('interface-changed',this.interfaceChangedHandler)        
        this.deviceAccess.off('scanstate-changed',this.scanStateChangeHandler)        
}

    
    autoConnect() {
        const {state} = this.state        
        const  {enabled,name} = this.props

        if (!enabled)
            return
        if ( !state || state==='unknown' || state==='disconnected') {
            const info = this.deviceAccess.getInterfaceInfo(name)
            if (info.state!=='connected' && info.state!=='connecting')
                this.deviceAccess.connect(name).catch()
        }
    }

    async onInterfaceChanged(ifName,ifInfo) {
        if (ifName!==this.props.name)
            return;
        
        const {state,isScanning} = ifInfo

        const changed = ( state!==this.state.ifState || isScanning!==this.state.isScanning)
        if ( changed) 

            while (this.setStateBusy)
                await sleep(50)

            this.setStateBusy = true
            this.setState({ifState:state},(newState) => {
                this.setStateBusy = false
            })

    }

    onScanStateChanged(state) {
        
        const scanState = state
        const tsUpdate = Date.now()
        this.setState({scanState,tsUpdate})
    


    }


    render() {
        
        const {ifState,scanState} = this.state
        const {enabled} = this.props

        const onClick = ifState==='unavailable' ? undefined : this.props.onClick
        const props =  {
            ...this.props,onClick,
            ifState,enabled, scanState

        }
        return (
            <InterfaceInfo {...props}/>
        )

    }

}

export class InterfaceInfo  extends React.PureComponent{

    constructor (props) {
        super(props);

        this.state = { hover: false }
        this.prevColor = undefined
    }
   
    onHover() {
        const {ifState} = this.props
        if (ifState==='unavailable') {
            return
        }

        this.setState( {hover:true})
    }
    onHoverEnd() {
        const {ifState} = this.props
        if (ifState==='unavailable') {
            return
        }

        this.setState( {hover:false})
    }

    onClick() {
        if (this.props.ifState==='unavailable')
            return;
        if ( this.props.onClick) 
            this.props.onClick();
    }

    duplicateSize( size, mult) {
        const vals = size.match(/(\d+)(.*)/)
        if (vals.length===3)
            return `${vals[1]*mult}${vals[2]}` 
    }

    getLoader() {
        const { enabled,size,ifState,scanState} = this.props
        
        if (!enabled)
            return null

        if (ifState==='connecting' || ifState===undefined)
            return <ClipLoader style={{margin:'auto'}} color='white' size={this.duplicateSize(size,0.3)} loading={true}></ClipLoader>

        if (scanState==='started')
            return <BounceLoader style={{margin:'auto'}} color='red' size={this.duplicateSize(size,0.3)} loading={true}></BounceLoader>

        return null;
    }

    getColor() {
        const {enabled,ifState} = this.props
        
        if (!enabled || ifState==='unavailable') {
            return 'grey'
        }
            
        if (ifState==='connected')  {
            this.prevColor = 'green'
            return 'green'
        }
        else if (ifState==='disconnected' || ifState==='disconnecting' )  {            
            this.prevColor = 'red'
            return 'red'
        }

        if (this.prevColor)
            return this.prevColor

        this.prevColor = '#FFBF00'
        return this.prevColor
    }

    render() {
        const {name,ifState} = this.props
        const {hover} = this.state

        const icon = Icons[name]
        const text = Texts[name] || name
        const buttonProps = {icon} //this.copyPropsExcluding(['icon','name','onClick','text']);
        buttonProps.height = this.props.size;
        buttonProps.width = this.duplicateSize(this.props.size,1.5);
        const color = this.getColor()
        const url = hover&& ifState!=='unavailable' ? 'images/settings.svg' : icon;

        return (
            <Btn {...buttonProps} onClick={()=>this.onClick()}onMouseEnter={()=>this.onHover()} onMouseLeave={()=>this.onHoverEnd()}>
                
                <Row height='66.67%'>
                    <Column width='33.33%' background={color}>
                        {this.getLoader()}
                    </Column>
                    <Column width='66.67%' background={color}>
                        <ImgWhite src={url}/>
                    </Column>

                </Row>
                <Row height='33.33%' background={color}>
                    <TextBlock>
                        {text}
                    </TextBlock>

                </Row>


                
            </Btn>
        )

    }

}

