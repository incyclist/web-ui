import React, { Component } from 'react';
import { LoginDialog } from '../../../molecules/dialogs';
import { VeloHeroAppConnection } from 'incyclist-services';


export  class VeloLoginDialog extends Component {

    constructor(props) {
        super(props);
        this.state= {loading:false}
    }

    async login(username,password) {
        const velo = new VeloHeroAppConnection()
        return await velo.connect({username,password})

    }

    async updateState( state) {
        return new Promise (done=> {
            this.setState(state, ()=> {
                done()
            })
    
        })
    }


    // user clicks on OK, 
    async onOK ( user={}) {


        await this.updateState({loading:true})

        const {username,password} = user
        try {

            await this.login(username,password)
            await this.updateState({loading:false, error:null})
            this.props.onOK()
        }
        catch(err) {
           
            this.updateState({loading:false,error:err.message})
        }
      
        
    }
    

    onCancel() {
        if (this.props.onCancel)
            this.props.onCancel()

    }


    render() {
        const {loading,error} = this.state

        return(
            <LoginDialog
                logo='images/velo-white.png'       
                loading={loading}     
                error={error}
                onOK = {(user)=>this.onOK(user) }
                onCancel = { ()=>this.onCancel()}
            />
        )
    }
}