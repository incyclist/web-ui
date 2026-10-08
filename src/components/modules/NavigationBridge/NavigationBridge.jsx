import { useEffect } from "react"
import { useNavigate } from "react-router"
import NativeUiService from "../../../bindings/native-ui"

// `useNavigate()` only returns a usable function once this renders inside the Router
// (`MemoryRouter` in App.jsx). Registering it here, rather than calling `useNavigate()`
// directly from the ui binding, is what makes page-service navigation (`openPage`/`moveTo`)
// actually work - calls made before this mounts are queued, not dropped (see NativeUiService).
export const NavigationBridge = () => {
    const navigate = useNavigate()

    useEffect(() => {
        NativeUiService.getInstance().registerNavigate(navigate)
    }, [navigate])

    return null
}
