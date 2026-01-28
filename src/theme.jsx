import React from "react"
import { ThemeProvider } from "styled-components"

const base = {
    text: "black",
    theme: "#8dc100",
    link: "#8dc100",
    hover: "#8dc100",
    searching: "darkgrey",
    failed: "darkred",
    primaryButton: "#dd9933",
    secondaryButton: "none",
    normalButton: "#dd9933",
    disabledButton: "lightgrey",

    success: 'green',
    error:'red',
    warning:'#eb6100',
    info:'#005ea5',
    incomplete:'#bebebe',

    successText: 'white',
    errorText:'white',
    warningText:'black',
    infoText:'white',
    incompleteText:'black',

    primaryButtonText: "white",
    secondaryButtonText: "white",
    normalButtonText: "white",
    disabledButtonText: "white"


}

const background = {
    primary : "#0048BA",
    normal: "white",
    odd: "#CCCCCC",
    hover: "#8dc100",
    header: "#2c3e50",
    selected: "#dd9933"

}

const text = {
    primary : "#FFFFFF",
    normal: base.text
}

const _default = {
    title: {
        background:  "white",
        text: "#8dc100"
    },
    list: {
        header: {
            background:  background.header,
            text: 'white'   
        },
        selected: {
            background:  background.selected,
            text: text.primary    
        },
        hover: {
            background:  background.hover,
            text: text.primary    
        },
        normal: {
            background:  background.normal,
            text: text.normal    
        },
        even: {
            text: text.normal    
        },
        odd: {
            text: text.normal    
        }

    },
    button : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        primary: {
            background: base.primaryButton,
            text: base.primaryButtonText
        },
        normal: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        disabled: {
            background: base.disabledButton,
            text: base.disabledButtonText
        }, 
        secondary: {
            background: base.secondaryButton,
            text: base.secondaryButtonText
        } 
    },
    devices : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        selected: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        searching: {
            background: base.searching,
            text: base.normalButtonText
        },
        failed: {
            background: base.searching,
            text: base.normalButtonText
        } 
    },
    dialog: {
        background: 'linear-gradient(to bottom,rgba(255,255,255,1) 0%,rgba(222,222,222,1) 100%)',
        text:'black;'
    },
    dialogContent: {
        background: 'white',
        text:'black;'
    },
    buttonbar: {
        background: 'lightgrey'
    },


    rider: {
        helmet: 'yellow',
        shirt: 'yellow'//'#FFD700'
    },
    url: {
        color: 'blue'
    },
    colors: base
}

export const newUITheme = {
    title: {
        background:  "none",
        text: "white"
    },
    list: {
        header: {
            background:  'none',
            text: 'white'   
        },
        selected: {
            background:  background.selected,
            text: text.primary    
        },
        hover: {
            background:  background.hover,
            text: text.primary    
        },
        normal: {
            background:  'none',
            text: 'white'
        },
        even: {
            background:  'none',
            text: 'white'
        },
        odd: {
            background:  'none',
            text: 'white'
        },
        button: {
            background: 'none'
        }

    },
    button : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        primary: {
            background: base.primaryButton,
            text: base.primaryButtonText
        },
        normal: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        disabled: {
            background: base.disabledButton,
            text: base.disabledButtonText
        }, 
        secondary: {
            background: base.secondaryButton,
            text: base.secondaryButtonText
        } 
    },
    devices : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        selected: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        searching: {
            background: base.searching,
            text: base.normalButtonText
        },
        failed: {
            background: base.searching,
            text: base.normalButtonText
        } 
    },
    dialog: {
        background1: 'rgb(33,33,33,0.975)',
        background: 'linear-gradient(rgb(56,1,31,0.975),rgb(26,4,86,0.975))',
        background2: 'linear-gradient(#38011f,#180457)',
        
        

        text:'white',
        border:'#C0C0C0 1px solid',
        borderRadius: '1vh 1vw'
        
    },
    pageLists: {
        background: 'linear-gradient(rgb(56,1,31,0.3),rgb(26,4,86,0.3))',
    },
    dialogContent: {
        background: 'none',
        text:'white;'
    },

    buttonbar: {
        background: 'none'
    },
    navbar: {
        selected: {
            background: 'white',
            text: 'black',
        },
        normal: {
            background: 'none',
            text: 'white',
        }
    },

    rider: {
        helmet: '#E78200',
        shirt: 'white'//'#FFD700'
    },
    url: {
        color: 'cyan'
    },
    colors: base,
}



class Theme {

    constructor( ) {
        this.selected = "default";
        this.themes = {}; 

        this.add ("default",_default);
    }

    add( name, theme) {


        theme.menu = {
            background: theme.dialog.background,
            text: theme.dialog.text,
            border: theme.dialog.border,
            
            selected: theme.dialog.selected ?? {
                background:  background.selected,
                text: text.primary    
            },
            hover: theme.dialog.hover ?? {
                background:  background.hover,
                text: text.primary    
            },
        
        
        }
        this.themes[name]= theme;
        
    }

    select( name) {
        this.selected = name
    }

    get( name ) {

        return ( (name===undefined || this.themes[name]===undefined) ? this.themes[this.selected] : this.themes[name])
    }
 
}

const AppTheme = new Theme()

export const AppThemeProvider = (props)=> <ThemeProvider theme={AppTheme.get()} {...props}/>

export default AppTheme
