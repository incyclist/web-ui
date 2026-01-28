import React, { Component } from 'react';
import styled from 'styled-components';
import Loader from 'react-spinners/ClipLoader'

import AppTheme, { AppThemeProvider } from '../../../../theme';
import { Button,ButtonBar,EditPassword,EditText, UrlLink,Column, Row ,Overlay } from '../../../atoms';
import { Dialog } from '../../Dialog';


export const Radio = props => (
    <input type="radio" {...props} />
)

export const SettingsArea = styled.div`

    font-size: 2.2vh;
    padding-left: 0;
    padding:2vh;
    text-align: left;
    margin:0;
`
export const ContentArea1 = styled.div`
    position:relative;
    width: calc(100% - 2vw);
    height: calc(100% - 7.7vh);
    text-align: left;
    margin:auto;
    display: flex;
    flex-direction:column;
    margin-left: 1vw;
    padding-right: 1vw;
    margin-top: 1vh;
    margin-bottom: 1vh;
    
    top:0;
    left:0;
    background: ${props => props.background || 'none'};
`;

const ContentArea = styled(Column)`
    height: 100%;
    text-align: left;
    margin:auto;
    padding:0;
    padding-left: 1vw;
    padding-right: 1vw;
    top:0;
    left:0;
    height: calc(100% - 7.7vh);
    background: ${props => props.background || 'none'};
`;


const Error = styled.div`
    display: flex;
    flex-direction: row;
    color: red;
    padding-top: 1vh;    
    padding-bottom: 1vh;    
    width: 100%;
    align-items: center;
    justify-content: center;

`

const Logo = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    padding-bottom: 1vh;    
    align-items: center;
    justify-content: center;
`

const SpinnerArea = styled.div`
    position: absolute;
    z-level: 1000;
    left:0;
    top:0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

`

const tableTheme  = AppTheme.get().list;
export const Header=styled.div`
    background: ${tableTheme.header.background}}
    color:${tableTheme.header.text}}
`


export const Hint = styled.div`
    background-color: lightgray;
    font-size: ${props => props.size==='full' ? '2.2vh': '1.5vh'};
    text-color: black;
    margin-top: 2vh;
`;

export const NopLogger = {
    log: () => {},
    logEvent: () => {},
}


export class KomootLoginDialog extends Component {

    constructor(props={}) {
        super(props);      

        const {user={},error} = props;

        this.user = user||{}
        this.state = { valid: this.validate(false), error}
       
    }

    componentDidMount() {
        
    }
    componentDidUpdate( prevProps) {
        if (this.props.error!==prevProps.error)
            this.setState({error:this.props.error})

    }

    onOK() {
        if (!this.validate())
            return;

        if (this.props.onOK) {
            return this.props.onOK(this.user, (error)=> {
                if (error)
                    this.setState({error})
            })
        }
    }

    onCancel() {
        if (this.props.onCancel) {
            return this.props.onCancel()
        }        
    }

    onPillClick() {
        this.showIdOverlay()
    }

    showIdOverlay() {
        this.setState({showIdOverlay:true})       
    }

    hideIdOverlay() {
        this.setState({showIdOverlay:false})       
    }

    onChangeName(username) {
        const prev = {...this.user}
        this.user.username = username
        this.validate()

        if (prev.username!==username && this.state.error)
            this.setState({error:null})
    }

    onChangePassword(password) {
        const prev = {...this.user}
        
        this.user.password = password
        this.validate()

        if (prev.password!==password && this.state.error)
            this.setState({error:null})
        
    }

    onChangeId(id) {
        const prev = {...this.user}
        
        this.user.userid = id
        this.validate()

        if (prev.userid!==id && this.state.error)
            this.setState({error:null})
        
    }

    validate(updateState=true) {
        
        const {username,password,userid} = this.user
        const valid = updateState ? this.state.valid : false

        if (!username) {
            if (valid && updateState) this.setState({valid:false})
            return false
        }
        if ( !password) {
            if (valid && updateState) this.setState({valid:false})
            return false;
        }
        if ( !userid) {
            if (valid && updateState) this.setState({valid:false})
            return false;
        }

        if (!valid && updateState)
            this.setState({valid:true})
        return true;
    }

    render() {
        
        const {username,password,userid} = this.user;
        const {title='Login', loading} = this.props        
        const {valid,error} = this.state
        const logo = 'https://www.komoot.com/assets/4d8ae313eec53e6e.svg'

        return (
        <Dialog id='Login' title={title} level={10} onESC={()=>this.onCancel()} >

                <AppThemeProvider>
                    <ContentArea>
                        {logo ? <Logo> <img src={logo} alt={``} /></Logo> : null}                                        
                        <EditText className='username' label='komoot Email' labelPosition='before'  labelWidth='12ch' disabled={loading} value={username} onChange={(value)=>this.onChangeName(value) } />
                        <EditPassword label='Password' labelPosition='before' labelWidth='12ch' disabled={loading} value={password} onChange={(value)=>this.onChangePassword(value) }/>
                        <Row>
                            <EditText className='id' label='komoot ID' labelPosition='before'  labelWidth='12ch' disabled={loading} value={userid} onChange={(value)=>this.onChangeId(value) } /> 
                            <Button height='3vh' onClick={()=>{this.onPillClick()}} margin='0 0 1ch 0'  >?
                                {this.state.showIdOverlay ? <Overlay position='relative' height='10vh'>
                                    <Row>The komoot ID is shown on the Account Details page:</Row>
                                    <Row>
                                        <UrlLink url='https://www.komoot.com/account/details' text='https://www.komoot.com/account/details'/>
                                    </Row>
                                    <Button onClick={()=>{this.hideIdOverlay()}}>OK</Button>
                                </Overlay> : null}
                            </Button>

                        </Row>

                        { error ? <Error> {error} </Error> : null }
                        { loading ? <SpinnerArea><Loader size='3vh' loading={loading} /></SpinnerArea>: null}
                    </ContentArea>


                    <ButtonBar justify='center'>
                        
                            <Button primary={true} disabled={valid===false || error || loading} text='OK' onClick={()=>this.onOK()} />
                            <Button primary={false}  text='Cancel' onClick={()=>this.onCancel()} />
                        
                    </ButtonBar>
                </AppThemeProvider>


        </Dialog>
        )
    }
}


