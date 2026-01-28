import AppTheme, { newUITheme } from "../../theme"


export const useInitAppTheme = ()=> { 
    AppTheme.add('newUI', newUITheme)
    AppTheme.select('newUI')

}