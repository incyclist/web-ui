import React, { Component } from 'react';
import styled from 'styled-components';
import { AppThemeProvider } from '../../../../theme';
import Loader from 'react-spinners/ClipLoader'

import { Button,ButtonBar,EditPassword,EditText } from '../../../atoms';
import { Column } from "../../../atoms/layout/View";
import { Dialog } from '../../Dialog';



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


export class LoginDialog extends Component {

    constructor(props={}) {
        super(props);      

        const {user={},error} = props;

        this.user = user||{}
        this.state = { valid: this.validate(false), error}
       
    }

    componentDidUpdate( prevProps) {
        if (this.props.error!==prevProps.error)
            this.setState({error:this.props.error})

    }

    onOK() {
        if (!this.validate())
            return;

        if (this.props.onOK) {
            return this.props.onOK(this.user)
        }
    }

    onCancel() {
        if (this.props.onCancel) {
            return this.props.onCancel()
        }        
    }

    onChangeName(username) {
        const prev = Object.assign( {},this.user)
        this.user.username = username
        this.validate()

        if (prev.username!==username && this.state.error)
            this.setState({error:null})

        

        
    }

    onChangePassword(password) {
        const prev = Object.assign( {},this.user)
        
        this.user.password = password
        this.validate()

        if (prev.password!==password && this.state.error)
            this.setState({error:null})
        
    }

    validate(updateState=true) {
        
        const {username,password} = this.user
        const valid = updateState ? this.state.valid : false

        if (!username) {
            if (valid && updateState) this.setState({valid:false})
            return false
        }
        if ( !password) {
            if (valid && updateState) this.setState({valid:false})
            return false;
        }

        if (!valid && updateState)
            this.setState({valid:true})
        return true;
    }

    render() {
        
        const {username,password} = this.user;
        const {title='Login', logo,loading} = this.props
        const {valid,error} = this.state

        return (
        <Dialog id='Login' title={title} level={10} onESC={()=>this.onCancel()} >

                <AppThemeProvider>
                    <ContentArea>
                        {logo ? <Logo> <img src={logo} alt={``} /></Logo> : null}                                        
                        <EditText className='username' label='Username' labelPosition='before'  labelWidth='9ch' disabled={loading} value={username} onChange={(value)=>this.onChangeName(value) } />
                        <EditPassword label='Password' labelPosition='before' labelWidth='9ch' disabled={loading} value={password} onChange={(value)=>this.onChangePassword(value) }/>
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


